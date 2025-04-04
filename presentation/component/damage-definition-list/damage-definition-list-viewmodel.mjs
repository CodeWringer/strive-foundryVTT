import DiceRollListViewModel from "../dice-roll-list/dice-roll-list-viewmodel.mjs";
import DamageDefinitionListItemViewModel from "./damage-definition-list-item-viewmodel.mjs";
import InputViewModel from "../../view-model/input-view-model.mjs";
import DamageAndType from "../../../business/ruleset/skill/damage-and-type.mjs";
import TransientDocument from "../../../business/document/transient-document.mjs";
import { ValidationUtil } from "../../../business/util/validation-utility.mjs";

/**
 * Represents a rollable list of damage definitions. 
 * 
 * @extends InputViewModel
 * 
 * @property {Array<DamageAndType>} value
 * @property {DiceRollListViewModel} vmList
 * @property {Array<DamageDefinitionListItemViewModel>} damageDefinitionViewModels
 * @property {TransientDocument} resolveFormulaContext A document 
 * which is used to resolve references in the damage formulae. 
 * 
 * @method onChange Callback that is invoked when the value changes. 
 * Receives the following arguments: 
 * * `oldValue: {Array<DamageAndType>}`
 * * `newValue: {Array<DamageAndType>}`
 */
export default class DamageDefinitionListViewModel extends InputViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.COMPONENT_DAMAGE_DEFINITION_LIST; }
  
  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
   */
  static registerHandlebarsPartial() {
    Handlebars.registerPartial('damageDefinitionList', `{{> "${DamageDefinitionListViewModel.TEMPLATE}"}}`);
  }

  /**
   * @type {Array<DamageDefinitionListItemViewModel>}
   * @readonly
   * @private
   */
  damageDefinitionViewModels = [];

  /**
   * @param {Object} args
   * @param {Array<DamageAndType>} args.value The current value. 
   * @param {TransientDocument} args.resolveFormulaContext A document 
   * which is used to resolve references in the damage formulae. 
   * @param {Function | undefined} args.onChange Callback that is invoked 
   * when the value changes. Receives two arguments: 
   * * `oldValue: {Any}`
   * * `newValue: {Any}`
   * @param {String | undefined} args.chatTitle 
   * @param {String | undefined} args.localizedToolTip 
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["value", "resolveFormulaContext"]);

    this.chatTitle = args.chatTitle;
    this.resolveFormulaContext = args.resolveFormulaContext;

    const damageDefinitions = this.value;
    for (let i = 0; i < damageDefinitions.length; i++) {
      const damageDefinition = damageDefinitions[i];

      const vm = new DamageDefinitionListItemViewModel({
        id: `vmDamageDefinition-${i}`,
        parent: this,
        value: damageDefinition,
        localizedLabel: game.i18n.localize(damageDefinition.damageType.localizableName),
        iconClass: damageDefinition.damageType.iconClass,
        onChange: (_, newItemValue) => {
          if (ValidationUtil.isDefined(newItemValue) !== true) return;
          
          const newDamageDefinitions = this.value.concat([]);
          newDamageDefinitions[i] = newItemValue;
          this.value = newDamageDefinitions;
        },
        onDelete: () => {
          const newDamageDefinitions = damageDefinitions.concat([]);
          newDamageDefinitions.splice(i, 1);
          this.value = newDamageDefinitions;
        },
        resolveFormula: () => {
          // At this point, the string may contain `@`-references. These must be resolved. 
          let resolvedDamage = damageDefinition.damage;

          const resolvedReferences = this.resolveFormulaContext.resolveReferences(damageDefinition.damage);
          for (const [key, value] of resolvedReferences) {
            // Skip unresolvable values. These are returned as-is. 
            if (value === undefined) continue;

            // This replaces every reference of the current type, e. g. `"@strength"` with the 
            // current level or value of the thing, if possible. 
            // If a value cannot be determined, it will default to "0". 
            const regExpReplace = new RegExp(key, "gi");
            const replaceValue = ((value.modifiedLevel ?? value.level) ?? value.value) ?? (ValidationUtil.isNumber(value) === true ? value : "0");
            resolvedDamage = resolvedDamage.replace(regExpReplace, replaceValue);
          }

          return resolvedDamage;
        },
      });
      this.damageDefinitionViewModels.push(vm);
    }

    this.vmList = new DiceRollListViewModel({
      id: `vmList`,
      parent: this,
      isEditable: this.isEditable,
      isSendable: this.isSendable,
      isOwner: this.isOwner,
      isGM: this.isGM,
      formulaViewModels: this.damageDefinitionViewModels,
      formulaListItemTemplate: DamageDefinitionListItemViewModel.TEMPLATE,
      chatMessageTemplate: game.strive.const.TEMPLATES.DICE_ROLL_DAMAGE_CHAT_MESSAGE,
      chatMessageDataProvider: (rolls) => {
        let rollTotal = 0;
        for (const roll of rolls) {
          rollTotal += roll.rollTotal;
        }
        return {
          title: this.chatTitle,
          rolls: rolls,
          rollTotal: rollTotal,
        };
      },
    });
  }
}
