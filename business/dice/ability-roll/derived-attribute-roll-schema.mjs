import { VISIBILITY_MODES } from "../../../presentation/chat/visibility-modes.mjs";
import DynamicInputDefinition from "../../../presentation/dialog/dynamic-input-dialog/dynamic-input-definition.mjs";
import { DYNAMIC_INPUT_TYPES } from "../../../presentation/dialog/dynamic-input-dialog/dynamic-input-types.mjs";
import { Sum, SumComponent } from "../../ruleset/summed-data.mjs";
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
