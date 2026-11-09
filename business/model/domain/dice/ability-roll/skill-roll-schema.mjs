import { StringUtil } from "../../../../../common/util/string-utility.mjs";
import { ValidationUtil } from "../../../../../common/util/validation-utility.mjs";
import DynamicComponent from "../../../../../presentation/application/component/dynamic-component/dynamic-component.mjs";
import InputDropDownViewModel from "../../../../../presentation/application/component/input-choice/input-dropdown/input-dropdown-viewmodel.mjs";
import InputNumberSpinnerViewModel from "../../../../../presentation/application/component/input-number-spinner/input-number-spinner-viewmodel.mjs";
import InputTextFieldViewModel from "../../../../../presentation/application/component/input-textfield/input-textfield-viewmodel.mjs";
import RowViewModel from "../../../../../presentation/application/component/row/row-viewmodel.mjs";
import { GameSystemUserSettings } from "../../../../setting/game-system-user-settings.mjs";
import CharacterActorDocument from "../../../document/actor/character-actor-document.mjs";
import SkillDocument from "../../../document/item/skill-document.mjs";
import { Sum, SumComponent } from "../../summed-data.mjs";
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
   * @type {SkillDocument}
   * @private
   */
  get #owningDocument() {
    if (ValidationUtil.isDefined(this._owningDocumentOverride)) {
      return this._owningDocumentOverride;
    } else {
      return this.document.parentDocument;
    }
  }

  /**
   * @param {Object} args 
   * @param {SkillDocument} args.document
   * @param {CharacterActorDocument | undefined} args.owningDocumentOverride
   */
  constructor(args = {}) {
    super(args);

    this._owningDocumentOverride = args.owningDocumentOverride;
  }

  /** @override */
  getAvailableDiceComponents() {
    const owningDocument = this.#owningDocument;
    if (!ValidationUtil.isDefined(owningDocument)) return;

    const diceComponents = this.document.baseAttributes
      .map(baseAttribute => owningDocument.attributes.find(attribute => attribute.name === baseAttribute.name))
      .map(attribute => new SumComponent({
        name: attribute.name,
        localizableName: attribute.localizableName,
        value: attribute.level
      }));

    return [
      new Sum(diceComponents),
    ];
  }

  /**
   * @param {RollQueryData} rollQueryData 
   * @returns {Promise<RollData>}
   * 
   * @async
   * @override
   */
  async getRollData(rollQueryData) {
    const diceComponents = this.getAvailableDiceComponents()[0];

    return new RollData({
      dieFaces: this.dieFaces,
      hitThreshold: this.hitThreshold,
      obFormula: rollQueryData.ob,
      diceComponents: diceComponents,
      modifyDiceComponent: new SumComponent({
        name: RollSchema.MODIFY_DICE_COMPONENT,
        localizableName: "system.roll.modifyDice",
        value: rollQueryData.modifyDice,
      }),
      edge: rollQueryData.edge,
      rollModifier: rollQueryData.rollModifier,
      hitLimit: this.document.level,
    });
  }

  /** @override */
  getAvailableDiceComponentExplanation() {
    const owningDocument = this.#owningDocument;
    return this.document.baseAttributes
      .map(baseAttribute => owningDocument.attributes.find(attribute => attribute.name === baseAttribute.name))
      .map(attribute => `${attribute.level} (${StringUtil.getLoca(attribute.localizableName)})`)
      .join(" + ");
  }

  /**
   * @param {DynamicInputDialog} dialog 
   * 
   * @override
   */
  async _queryRollData(dialog) {
    // Input definitions specific to dice pool rolls. 
    const nameInputObstacle = "inputObstacle";
    const nameInputModifyDice = "inputBonusDice";
    const nameInputEdge = "inputEdge";

    const owningDocument = this.#owningDocument;
    // const actor = owningDocument.document;
    // const attributes = document.baseAttributes.map(attribute => new CharacterAttribute(actor, attribute.name));

    const availableDiceExplanation = this.getAvailableDiceComponentExplanation(document);
    
    let diceCompositionAndReminder = `<p class="font-size-sm">${availableDiceExplanation}</p>`;
    const showReminders = GameSystemUserSettings.get(GameSystemUserSettings.KEY_TOGGLE_REMINDERS);
    if (showReminders) {
      diceCompositionAndReminder = `${diceCompositionAndReminder}<p>${StringUtil.getLoca("system.roll.forkReminder")}</p>`;
    }

    dialog.sections.splice(0, 0, // Insert the following before the visibility drop down. 
      new DynamicComponent({
        html: diceCompositionAndReminder,
      }),
      new DynamicComponent({
        template: RowViewModel.TEMPLATE,
        cssClass: "grid-2col",
        viewModelFactory: (parent) => new RowViewModel({
          parent: parent,
          sections: [
            new DynamicComponent({
              html: `<p>${StringUtil.getLoca("system.roll.obstacle.abbreviation")}</p>`
            }),
            new DynamicComponent({
              template: InputTextFieldViewModel.TEMPLATE,
              viewModelFactory: (parent) => new InputTextFieldViewModel({
                id: nameInputObstacle,
                parent: parent,
                value: "0",
                placeholder: StringUtil.getLoca("system.roll.obstacle.rollForPlaceholder"),
                // validationFunc: (value) => { return ValidationUtil.isNotBlankOrUndefined(value); },
              }),
            }),
          ],
        }),
      }),
      new DynamicComponent({
        template: RowViewModel.TEMPLATE,
        cssClass: "grid-2col",
        viewModelFactory: (parent) => new RowViewModel({
          parent: parent,
          sections: [
            new DynamicComponent({
              html: `<p>${StringUtil.getLoca("system.roll.modifyDice")}</p>`
            }),
            new DynamicComponent({
              template: InputNumberSpinnerViewModel.TEMPLATE,
              viewModelFactory: (parent) => new InputNumberSpinnerViewModel({
                id: nameInputModifyDice,
                parent: parent,
                value: 0,
                // validationFunc: (value) => { return parseInt(value) !== NaN; },
              }),
            }),
          ],
        }),
      }),
      new DynamicComponent({
        template: RowViewModel.TEMPLATE,
        cssClass: "grid-2col",
        viewModelFactory: (parent) => new RowViewModel({
          parent: parent,
          sections: [
            new DynamicComponent({
              html: `<p>${StringUtil.getLoca("system.roll.edge")}</p>`
            }),
            new DynamicComponent({
              template: InputNumberSpinnerViewModel.TEMPLATE,
              viewModelFactory: (parent) => new InputNumberSpinnerViewModel({
                id: nameInputEdge,
                parent: parent,
                value: 0,
                // validationFunc: (value) => { return parseInt(value) !== NaN; },
              }),
            }),
          ],
        }),
      }),
      new DynamicComponent({
        template: RowViewModel.TEMPLATE,
        cssClass: "grid-2col",
        viewModelFactory: (parent) => new RowViewModel({
          parent: parent,
          sections: [
            new DynamicComponent({
              html: `<p>${StringUtil.getLoca("system.roll.edge")}</p>`
            }),
            new DynamicComponent({
              template: InputDropDownViewModel.TEMPLATE,
              viewModelFactory: (parent) => new InputDropDownViewModel({
                id: nameInputRollDiceModifier,
                parent: parent,
                options: ROLL_DICE_MODIFIER_TYPES.asChoices(),
                value: ROLL_DICE_MODIFIER_TYPES.asChoices().find(it => it.value === ROLL_DICE_MODIFIER_TYPES.NONE.name),
              }),
            }),
          ],
        }),
      }),
    );

    await dialog.renderAndAwait(true);
    if (dialog.confirmed !== true) return undefined;

    return new RollQueryData({
      ob: dialog.find(nameInputObstacle),
      bonusDice: parseInt(dialog.find(nameInputModifyDice)),
      edge: parseInt(dialog.find(nameInputEdge)),
      rollModifier: ROLL_DICE_MODIFIER_TYPES.asArray().find(it => it.name === dialog.find(nameInputRollDiceModifier).value),
      visbilityMode: VISIBILITY_MODES.asArray().find(it => it.name === dialog.find(this._nameInputVisibility).value),
    });
  }
}
