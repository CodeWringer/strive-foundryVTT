import { VISIBILITY_MODES } from "../../../../presentation/chat/visibility-modes.mjs";
import ChoiceOption from "../../../../presentation/component/input-choice/choice-option.mjs";
import DynamicInputDefinition from "../../../../presentation/dialog/dynamic-input-dialog/input-types/dynamic-input-definition.mjs";
import DynamicInputDialog from "../../../../presentation/dialog/dynamic-input-dialog/dynamic-input-dialog.mjs";
import { DYNAMIC_INPUT_TYPES } from "../../../../presentation/dialog/dynamic-input-dialog/input-types/dynamic-input-types.mjs";
import { ACTOR_TYPES } from "../../../document/actor/actor-types.mjs";
import TransientSkill from "../../../document/item/skill/transient-skill.mjs";
import CharacterAttribute from "../../../ruleset/attribute/character-attribute.mjs";
import { Sum, SumComponent } from "../../../ruleset/summed-data.mjs";
import GameSystemUserSettings from "../../../setting/game-system-user-settings.mjs";
import RollData from "../../roll-data.mjs";
import { ROLL_DICE_MODIFIER_TYPES } from "../../roll-dice-modifier-types.mjs";
import { RollSchema } from "../../roll-schema.mjs";
import { SkillRollSchema } from "../skill-roll-schema.mjs";
import AttributeAndSkillRollQueryData from "./attribute-and-skill-roll-query-data.mjs";
import DynamicInputDefinitionLabel from "../../../../presentation/dialog/dynamic-input-dialog/input-types/dynamic-input-definition-label.mjs";
import DynamicInputDefinitionTextfield from "../../../../presentation/dialog/dynamic-input-dialog/input-types/dynamic-input-definition-textfield.mjs";
import DynamicInputDefinitionDropdown from "../../../../presentation/dialog/dynamic-input-dialog/input-types/dynamic-input-definition-dropdown.mjs";
import DynamicInputDefinitionNumberSpinner from "../../../../presentation/dialog/dynamic-input-dialog/input-types/dynamic-input-definition-number-spinner.mjs";

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
      new DynamicInputDefinitionDropdown({
        name: nameInputAttribute,
        localizedLabel: game.i18n.localize("system.character.attribute.singular"),
        required: true,
        isEditable: baseAttributeChoices.length > 1,
        defaultValue: baseAttributeChoices.find(choice => choice.value === bestAttribute.name),
        options: baseAttributeChoices,
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

    const showReminders = new GameSystemUserSettings().get(GameSystemUserSettings.KEY_TOGGLE_REMINDERS);
    const isPC = document.owningDocument.type === ACTOR_TYPES.PC;
    if (showReminders && isPC) {
      dialog.inputDefinitions.splice(1, 0, // Insert after the dice composition. 
        new DynamicInputDefinitionLabel({
          name: "forkReminderLabel",
          localizedLabel: `<p>${game.i18n.localize("system.character.skill.forking.reminder.label")}</p>`,
          showFancyFont: false,
        }),
      );
    }

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
    return [
      new SumComponent(characterAttribute.name, characterAttribute.localizableName, characterAttribute.modifiedLevel),
      new SumComponent(document.name, document.name, document.modifiedLevel),
    ];
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
