import { VISIBILITY_MODES } from "../../../presentation/chat/visibility-modes.mjs";
import DynamicInputDefinitionDropdown from "../../../presentation/dialog/dynamic-input-dialog/input-types/dynamic-input-definition-dropdown.mjs";
import DynamicInputDefinitionLabel from "../../../presentation/dialog/dynamic-input-dialog/input-types/dynamic-input-definition-label.mjs";
import DynamicInputDefinitionNumberSpinner from "../../../presentation/dialog/dynamic-input-dialog/input-types/dynamic-input-definition-number-spinner.mjs";
import DynamicInputDefinitionTextfield from "../../../presentation/dialog/dynamic-input-dialog/input-types/dynamic-input-definition-textfield.mjs";
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
      hitModifier: 0,
      compensationPoints: rollQueryData.compensationPoints,
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
    const nameInputCompensationPoints = "inputCompensationPoints";
    const nameInputRollDiceModifier = "inputRollDiceModifier";

    dialog.inputDefinitions.splice(0, 0, // Insert the following before the visibility drop down. 
      new DynamicInputDefinitionLabel({
        name: "diceCompositionLabel",
        localizedLabel: `<p class="font-size-sm">${diceComposition}</p>`,
        showFancyFont: false,
      }),
      new DynamicInputDefinitionTextfield({
        name: nameInputObstacle,
        localizedLabel: game.i18n.localize("system.roll.obstacle.abbreviation"),
        required: true,
        defaultValue: "0",
        placeholder: game.i18n.localize("system.roll.obstacle.rollForPlaceholder"),
      }),
      new DynamicInputDefinitionNumberSpinner({
        name: nameInputBonusDice,
        localizedLabel: game.i18n.localize("system.roll.bonusDice"),
        required: true,
        defaultValue: 0,
      }),
      new DynamicInputDefinitionNumberSpinner({
        name: nameInputCompensationPoints,
        localizedLabel: game.i18n.localize("system.roll.compensationPoints"),
        required: true,
        defaultValue: 0,
      }),
      new DynamicInputDefinitionDropdown({
        name: nameInputRollDiceModifier,
        localizedLabel: game.i18n.localize("system.roll.diceModifier.plural"),
        required: true,
        defaultValue: ROLL_DICE_MODIFIER_TYPES.asChoices().find(it => it.value === ROLL_DICE_MODIFIER_TYPES.NONE.name),
        options: ROLL_DICE_MODIFIER_TYPES.asChoices(),
      }),
    );

    await dialog.renderAndAwait(true);
    if (dialog.confirmed !== true) return undefined;

    return new RollQueryData({
      ob: dialog[nameInputObstacle],
      bonusDice: parseInt(dialog[nameInputBonusDice]),
      compensationPoints: parseInt(dialog[nameInputCompensationPoints]),
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
    return [
      new SumComponent(document.name, document.localizableName, document.modifiedLevel),
    ];
  }
}
