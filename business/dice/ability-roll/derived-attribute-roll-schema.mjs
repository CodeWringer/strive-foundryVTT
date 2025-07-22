import { VISIBILITY_MODES } from "../../../presentation/chat/visibility-modes.mjs";
import InputDropDownViewModel from "../../../presentation/component/input-choice/input-dropdown/input-dropdown-viewmodel.mjs";
import InputNumberSpinnerViewModel from "../../../presentation/component/input-number-spinner/input-number-spinner-viewmodel.mjs";
import InputTextFieldViewModel from "../../../presentation/component/input-textfield/input-textfield-viewmodel.mjs";
import DynamicInputDefinition from "../../../presentation/dialog/dynamic-input-dialog/dynamic-input-definition.mjs";
import { Sum, SumComponent } from "../../ruleset/summed-data.mjs";
import { ValidationUtil } from "../../util/validation-utility.mjs";
import RollData from "../roll-data.mjs";
import { ROLL_DICE_MODIFIER_TYPES } from "../roll-dice-modifier-types.mjs";
import RollQueryData from "../roll-query-data.mjs";
import { RollSchema } from "../roll-schema.mjs";

/**
 * Defines the roll data of a derived attribute. 
 * 
 * @property {Number} derivedAttributeValue Sets the number of dice. 
 * @property {String} internalName 
 * @property {String} localizableName 
 */
export class DerivedAttributeRollData {
  /**
   * @param {Object} args 
   * @param {Number} args.derivedAttributeValue Sets the number of dice. 
   * @param {String} args.internalName 
   * @param {String} args.localizableName 
   * to roll. 
   */
  constructor(args = {}) {
    this.derivedAttributeValue = args.derivedAttributeValue;
    this.internalName = args.internalName;
    this.localizableName = args.localizableName;
  }
}

/**
 * Defines a schema for rolling dice to test a derived attribute. 
 * 
 * @extends RollSchema
 */
export class DerivedAttributeRollSchema extends RollSchema {
  /** 
   * @param {DerivedAttributeRollData} document 
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
   * @param {DerivedAttributeRollData} document 
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
      new DynamicInputDefinition({
        name: "diceCompositionLabel",
        localizedLabel: `<p class="font-size-sm">${diceComposition}</p>`,
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
   * @param {DerivedAttributeRollData} document 
   * @returns {Array<SumComponent>}
   */
  _getDiceComponents(document) {
    return [
      new SumComponent(document.internalName, document.localizableName, document.derivedAttributeValue),
    ];
  }
}
