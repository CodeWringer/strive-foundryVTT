import { VISIBILITY_MODES } from "../../../presentation/chat/visibility-modes.mjs";
import DynamicInputDefinition from "../../../presentation/dialog/dynamic-input-dialog/dynamic-input-definition.mjs";
import { DYNAMIC_INPUT_TYPES } from "../../../presentation/dialog/dynamic-input-dialog/dynamic-input-types.mjs";
import { ACTOR_TYPES } from "../../document/actor/actor-types.mjs";
import CharacterAttribute from "../../ruleset/attribute/character-attribute.mjs";
import { Sum, SumComponent } from "../../ruleset/summed-data.mjs";
import RollData from "../roll-data.mjs";
import { ROLL_DICE_MODIFIER_TYPES } from "../roll-dice-modifier-types.mjs";
import RollQueryData from "../roll-query-data.mjs";
import { RollSchema } from "../roll-schema.mjs";

/**
 * Defines a schema for rolling dice to test an attribute. 
 * 
 * This schema simply takes the modified level of the attribute as the 
 * dice count. 
 * 
 * @extends RollSchema
 */
export class AttributeRollSchema extends RollSchema {
  /** 
   * @param {CharacterAttribute} document 
   * @param {RollQueryData} rollQueryData 
   * 
   * @override 
   */
  async getRollData(document, rollQueryData) {
    const diceComponents = this._getDiceComponents(document);

    return new RollData({
      dieFaces: this.dieFaces,
      hitThreshold: this.hitThreshold,
      obFormula: rollQueryData.ob,
      diceComponents: new Sum(diceComponents),
      bonusDiceComponent: new SumComponent(RollSchema.BONUS_DICE_COMPONENT, "system.roll.bonusDice", rollQueryData.bonusDice),
      modifier: 0,
      compensationPoints: 0,
      rollModifier: rollQueryData.rollModifier,
    });
  }

  /** 
   * @param {CharacterAttribute} document 
   * @param {RollQueryData} rollQueryData 
   * 
   * @override 
   */
  async _queryRollData(document, dialog) {
    const diceComponents = this._getDiceComponents(document);
    const diceComposition = diceComponents
      .map(it => `${it.value} ${game.i18n.localize(it.localizableName)}`)
      .join(", ");

    // Input definitions specific to dice pool rolls. 
    const nameInputObstacle = "inputObstacle";
    const nameInputBonusDice = "inputBonusDice";
    const nameInputRollDiceModifier = "inputRollDiceModifier";

    dialog.inputDefinitions.splice(0, 0, // Insert the following before the visibility drop down. 
      new DynamicInputDefinition({
        type: DYNAMIC_INPUT_TYPES.LABEL,
        name: "diceCompositionLabel",
        localizedLabel: `<p>${game.i18n.localize("system.roll.numberOfDice")}: ${diceComponents.total}</p><p class="font-size-sm">${diceComposition}</p>`,
        showFancyFont: false,
      }),
      new DynamicInputDefinition({
        type: DYNAMIC_INPUT_TYPES.TEXTFIELD,
        name: nameInputObstacle,
        localizedLabel: game.i18n.localize("system.roll.obstacle.abbreviation"),
        required: true,
        defaultValue: "",
        specificArgs: {
          placeholder: game.i18n.localize("system.roll.obstacle.rollForPlaceholder"),
        },
      }),
      new DynamicInputDefinition({
        type: DYNAMIC_INPUT_TYPES.NUMBER_SPINNER,
        name: nameInputBonusDice,
        localizedLabel: game.i18n.localize("system.roll.bonusDice"),
        required: true,
        defaultValue: 0,
      }),
      new DynamicInputDefinition({
        type: DYNAMIC_INPUT_TYPES.DROP_DOWN,
        name: nameInputRollDiceModifier,
        localizedLabel: game.i18n.localize("system.roll.diceModifier.plural"),
        required: true,
        defaultValue: ROLL_DICE_MODIFIER_TYPES.asChoices().find(it => it.value === ROLL_DICE_MODIFIER_TYPES.NONE.name),
        specificArgs: {
          options: ROLL_DICE_MODIFIER_TYPES.asChoices(),
        }
      }),
    );

    await dialog.renderAndAwait(true);
    if (dialog.confirmed !== true) return undefined;

    return new RollQueryData({
      ob: dialog[nameInputObstacle],
      bonusDice: parseInt(dialog[nameInputBonusDice]),
      rollModifier: ROLL_DICE_MODIFIER_TYPES.asArray().find(it => it.name === dialog[nameInputRollDiceModifier].value),
      visbilityMode: VISIBILITY_MODES.asArray().find(it => it.name === dialog[this._nameInputVisibility].value),
    });
  }
  
  /**
   * Returns the dice components that comprise the attribute. 
   * 
   * @param {CharacterAttribute} document 
   * @returns {Array<SumComponent>}
   */
  _getDiceComponents(document) {
    const actor = document.owningActor;
    if (actor.type === ACTOR_TYPES.NPC && actor.dependsOnActiveCr === true) {
      return [
        new SumComponent("challengeRating", "system.character.advancement.challengeRating.label", actor.challengeRating.modified),
      ];
    } else {
      return [
        new SumComponent(document.name, document.localizableName, document.modifiedLevel),
      ];
    }
  }

}
