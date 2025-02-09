import { VISIBILITY_MODES } from "../../../../presentation/chat/visibility-modes.mjs";
import ChoiceOption from "../../../../presentation/component/input-choice/choice-option.mjs";
import DynamicInputDefinition from "../../../../presentation/dialog/dynamic-input-dialog/dynamic-input-definition.mjs";
import DynamicInputDialog from "../../../../presentation/dialog/dynamic-input-dialog/dynamic-input-dialog.mjs";
import { DYNAMIC_INPUT_TYPES } from "../../../../presentation/dialog/dynamic-input-dialog/dynamic-input-types.mjs";
import TransientSkill from "../../../document/item/skill/transient-skill.mjs";
import CharacterAttribute from "../../../ruleset/attribute/character-attribute.mjs";
import { Sum, SumComponent } from "../../../ruleset/summed-data.mjs";
import RollData from "../../roll-data.mjs";
import { ROLL_DICE_MODIFIER_TYPES } from "../../roll-dice-modifier-types.mjs";
import { RollSchema } from "../../roll-schema.mjs";
import { SkillRollSchema } from "../skill-roll-schema.mjs";
import AttributeAndSkillRollQueryData from "./attribute-and-skill-roll-query-data.mjs";

/**
 * Defines a schema for rolling dice to test a skill. 
 * 
 * This schema adds the level of only one base attribute to the level of the skill. 
 * The resulting sum is the number of dice to roll. 
 * 
 * @extends SkillRollSchema
 */
export class AttributeAndSkillRollSchema extends SkillRollSchema {
  /**
   * @param {TransientSkill} document 
   * @param {AttributeAndSkillRollQueryData} rollQueryData 
   * 
   * @override
   */
  async getRollData(document, rollQueryData) {
    const diceComponents = this._getDiceComponents(document, rollQueryData.attribute);

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
   * @param {TransientSkill} document 
   * @param {DynamicInputDialog} dialog 
   * 
   * @override
   */
  async _queryRollData(document, dialog) {
    // Input definitions specific to dice pool rolls. 
    const nameInputObstacle = "inputObstacle";
    const nameInputAttribute = "inputAttribute";
    const nameInputBonusDice = "inputBonusDice";
    const nameInputCompensationPoints = "inputCompensationPoints";
    const nameInputRollDiceModifier = "inputRollDiceModifier";

    const actor = document.owningDocument.document;
    const attributes = document.baseAttributes.map(attribute => new CharacterAttribute(actor, attribute.name));

    const bestAttribute = this._getBestAttribute(attributes);
    const baseAttributeChoices = attributes.map(attribute => new ChoiceOption({
      value: attribute.name,
      localizedValue: game.i18n.localize(attribute.localizableName),
    }));

    let diceComposition = attributes
      .map(attribute => `${attribute.modifiedLevel} ${game.i18n.localize(attribute.localizableName)}`)
      .join(" | ");
    diceComposition = `(${diceComposition}), ${document.modifiedLevel} ${document.name}`;

    dialog.inputDefinitions.splice(0, 0, // Insert the following before the visibility drop down. 
      new DynamicInputDefinition({
        type: DYNAMIC_INPUT_TYPES.LABEL,
        name: "diceCompositionLabel",
        localizedLabel: `<p class="font-size-sm">${diceComposition}</p>`,
        showFancyFont: false,
      }),
      new DynamicInputDefinition({
        type: DYNAMIC_INPUT_TYPES.TEXTFIELD,
        name: nameInputObstacle,
        localizedLabel: game.i18n.localize("system.roll.obstacle.abbreviation"),
        required: true,
        defaultValue: "0",
        specificArgs: {
          placeholder: game.i18n.localize("system.roll.obstacle.rollForPlaceholder"),
        },
      }),
      new DynamicInputDefinition({
        type: DYNAMIC_INPUT_TYPES.DROP_DOWN,
        name: nameInputAttribute,
        localizedLabel: game.i18n.localize("system.character.attribute.singular"),
        required: true,
        isEditable: baseAttributeChoices.length > 1,
        defaultValue: baseAttributeChoices.find(choice => choice.value === bestAttribute.name),
        specificArgs: {
          options: baseAttributeChoices,
        }
      }),
      new DynamicInputDefinition({
        type: DYNAMIC_INPUT_TYPES.NUMBER_SPINNER,
        name: nameInputBonusDice,
        localizedLabel: game.i18n.localize("system.roll.bonusDice"),
        required: true,
        defaultValue: 0,
      }),
      new DynamicInputDefinition({
        type: DYNAMIC_INPUT_TYPES.NUMBER_SPINNER,
        name: nameInputCompensationPoints,
        localizedLabel: game.i18n.localize("system.roll.compensationPoints"),
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

    return new AttributeAndSkillRollQueryData({
      attribute: attributes.find(attribute => attribute.name === dialog[nameInputAttribute].value),
      ob: dialog[nameInputObstacle],
      bonusDice: parseInt(dialog[nameInputBonusDice]),
      compensationPoints: parseInt(dialog[nameInputCompensationPoints]),
      rollModifier: ROLL_DICE_MODIFIER_TYPES.asArray().find(it => it.name === dialog[nameInputRollDiceModifier].value),
      visbilityMode: VISIBILITY_MODES.asArray().find(it => it.name === dialog[this._nameInputVisibility].value),
    });
  }
  
  /**
   * Returns the dice components that comprise the sum of attribute and skill. 
   * 
   * @param {TransientSkill} document 
   * @param {CharacterAttribute} characterAttribute
   * 
   * @returns {Array<SumComponent>}
   * 
   * @private
   */
  _getDiceComponents(document, characterAttribute) {
    if (document.dependsOnActiveCr === true) {
      return [
        new SumComponent("challengeRating", "system.character.advancement.challengeRating.label", document.owningDocument.challengeRating.modified),
        new SumComponent(document.name, "system.character.advancement.modifier.label", document.levelModifier),
      ];
    } else {
      return [
        new SumComponent(characterAttribute.name, characterAttribute.localizableName, characterAttribute.modifiedLevel),
        new SumComponent(document.name, document.name, document.modifiedLevel),
      ];
    }
  }

  /**
   * Returns the character attribute with the highest modified level. 
   * 
   * @param {Array<CharacterAttribute>} attributes 
   * 
   * @returns {CharacterAttribute}
   * 
   * @private
   */
  _getBestAttribute(attributes) {
    let best = attributes[0];

    attributes.forEach(attribute => {
      if (attribute.modifiedLevel > best.modifiedLevel) {
        best = attribute;
      }
    });

    return best;
  }

}
