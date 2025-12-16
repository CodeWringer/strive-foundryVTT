import { VISIBILITY_MODES } from "../../../presentation/chat/visibility-modes.mjs";
import InputDropDownViewModel from "../../../presentation/component/input-choice/input-dropdown/input-dropdown-viewmodel.mjs";
import InputNumberSpinnerViewModel from "../../../presentation/component/input-number-spinner/input-number-spinner-viewmodel.mjs";
import InputTextFieldViewModel from "../../../presentation/component/input-textfield/input-textfield-viewmodel.mjs";
import DynamicInputDefinition from "../../../presentation/dialog/dynamic-input-dialog/dynamic-input-definition.mjs";
import { ACTOR_TYPES } from "../../document/actor/actor-types.mjs";
import TransientSkill from "../../document/item/skill/transient-skill.mjs";
import CharacterAttribute from "../../ruleset/attribute/character-attribute.mjs";
import { Sum, SumComponent } from "../../ruleset/summed-data.mjs";
import GameSystemUserSettings from "../../setting/game-system-user-settings.mjs";
import { ValidationUtil } from "../../util/validation-utility.mjs";
import RollData from "../roll-data.mjs";
import { ROLL_DICE_MODIFIER_TYPES } from "../roll-dice-modifier-types.mjs";
import RollQueryData from "../roll-query-data.mjs";
import { RollSchema } from "../roll-schema.mjs";

/**
 * Defines a schema for rolling dice to test a skill. 
 * 
 * @extends RollSchema
 */
export class SkillRollSchema extends RollSchema {
  /**
   * @param {Object} args 
   * @param {Number | undefined} args.dieFaces The number of faces on a die. 
   * * default `6`
   * @param {Number | undefined} args.hitThreshold Sets the lower bound of faces that are considered 
   * hits. Any face turning up this number and numbers above, are considered hits. 
   * * default `5`
   * 
   * @param {TransientBaseActor | undefined} args.owningDocumentOverride If set, will be treated as the Skill's parent, 
   * even if it isn't. This is for use in synthetic Skill rolling. 
   */
  constructor(args = {}) {
    super(args);

    this._owningDocumentOverride = args.owningDocumentOverride;
  }

  /**
   * @param {TransientSkill} skillDocument 
   * @param {RollQueryData} rollQueryData 
   * 
   * @override
   */
  async getRollData(skillDocument, rollQueryData) {
    const owningDocument = this._owningDocumentOverride ?? skillDocument.owningDocument;
    if (!ValidationUtil.isDefined(owningDocument)) return;

    const diceComponents = skillDocument.baseAttributes
    .map(it => new CharacterAttribute(owningDocument, it.name))
    .map(it => new SumComponent(it.name, it.localizableName, it.modifiedLevel));

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

  /** @override */
  getAvailableDiceComponents(skillDocument) {
    const owningDocument = this._owningDocumentOverride ?? skillDocument.owningDocument;
    const diceComponents = skillDocument.baseAttributes
    .map(it => new CharacterAttribute(owningDocument, it.name))
    .map(it => new SumComponent(it.name, it.localizableName, it.modifiedLevel));

    return [
      new Sum(diceComponents),
    ];
  }

  /** @override */
  getAvailableDiceComponentExplanation(skillDocument) {
    const owningDocument = this._owningDocumentOverride ?? skillDocument.owningDocument;
    return skillDocument.baseAttributes
    .map(it => new CharacterAttribute(owningDocument, it.name))
    .map(it => `${it.modifiedLevel} (${game.i18n.localize(it.localizableName)})`)
    .join(" + ");
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
    const nameInputBonusDice = "inputBonusDice";
    const nameInputCompensationPoints = "inputCompensationPoints";
    const nameInputRollDiceModifier = "inputRollDiceModifier";

    const owningDocument = this._owningDocumentOverride ?? document.owningDocument;
    const actor = owningDocument.document;
    const attributes = document.baseAttributes.map(attribute => new CharacterAttribute(actor, attribute.name));

    const availableDiceExplanation = this.getAvailableDiceComponentExplanation(document);

    dialog.inputDefinitions.splice(0, 0, // Insert the following before the visibility drop down. 
      new DynamicInputDefinition({
        name: "diceCompositionLabel",
        localizedLabel: `<p class="font-size-sm">${availableDiceExplanation}</p>`,
        showFancyFont: false,
      }),
      new DynamicInputDefinition({
        name: nameInputObstacle,
        localizedLabel: game.i18n.localize("system.roll.obstacle.abbreviation"),
        template: InputTextFieldViewModel.TEMPLATE,
        viewModelFactory: (id, parent, overrides) => new InputTextFieldViewModel({
          id: id,
          parent: parent,
          value: "0",
          placeholder: game.i18n.localize("system.roll.obstacle.rollForPlaceholder"),
          ...overrides,
        }),
        required: true,
        validationFunc: (value) => { return ValidationUtil.isNotBlankOrUndefined(value); },
      }),
      new DynamicInputDefinition({
        name: nameInputBonusDice,
        localizedLabel: game.i18n.localize("system.roll.bonusDice"),
        template: InputNumberSpinnerViewModel.TEMPLATE,
        viewModelFactory: (id, parent, overrides) => new InputNumberSpinnerViewModel({
          id: id,
          parent: parent,
          value: 0,
          ...overrides,
        }),
        required: true,
        validationFunc: (value) => { return parseInt(value) !== NaN; },
      }),
      new DynamicInputDefinition({
        name: nameInputCompensationPoints,
        localizedLabel: game.i18n.localize("system.roll.compensationPoints"),
        template: InputNumberSpinnerViewModel.TEMPLATE,
        viewModelFactory: (id, parent, overrides) => new InputNumberSpinnerViewModel({
          id: id,
          parent: parent,
          value: 0,
          ...overrides,
        }),
        required: true,
        validationFunc: (value) => { return parseInt(value) !== NaN; },
      }),
      new DynamicInputDefinition({
        name: nameInputRollDiceModifier,
        localizedLabel: game.i18n.localize("system.roll.diceModifier.plural"),
        template: InputDropDownViewModel.TEMPLATE,
        viewModelFactory: (id, parent, overrides) => new InputDropDownViewModel({
          id: id,
          parent: parent,
          options: ROLL_DICE_MODIFIER_TYPES.asChoices(),
          value: ROLL_DICE_MODIFIER_TYPES.asChoices().find(it => it.value === ROLL_DICE_MODIFIER_TYPES.NONE.name),
          ...overrides,
        }),
      }),
    );

    const showReminders = new GameSystemUserSettings().get(GameSystemUserSettings.KEY_TOGGLE_REMINDERS);
    const isPC = owningDocument.type === ACTOR_TYPES.PC;
    if (showReminders && isPC) {
      dialog.inputDefinitions.splice(1, 0, // Insert after the dice composition. 
        new DynamicInputDefinition({
          name: "forkReminderLabel",
          localizedLabel: `<p>${game.i18n.localize("system.character.skill.forking.reminder.label")}</p>`,
          showFancyFont: false,
        }),
      );
    }

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

}
