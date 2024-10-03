import { DAMAGE_TYPES, getDamageTypeIconClass } from "../../../business/ruleset/damage-types.mjs"
import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import ButtonViewModel from "../button/button-viewmodel.mjs";
import InputDropDownViewModel from "../input-choice/input-dropdown/input-dropdown-viewmodel.mjs";
import InputTextFieldViewModel from "../input-textfield/input-textfield-viewmodel.mjs";
import InputViewModel from "../../view-model/input-view-model.mjs";
import DamageAndType from "../../../business/ruleset/skill/damage-and-type.mjs";
import * as StringUtil from "../../../business/util/string-utility.mjs";

/**
 * Represents the definition of a damage roll formula. 
 * 
 * @extends InputViewModel
 * 
 * @property {DamageAndType} value 
 * @property {Array<ChoiceOption>} damageTypeOptions An array of damage type choices. 
 * * Read-only.
 * @property {String} localizedLabel Returns the localized label of the roll total. 
 * I. e. the localized damage type. 
 * * Read-only. 
 * 
 * @method onChange Callback that is invoked when the value changes. 
 * Receives the following arguments: 
 * * `oldValue: {DamageAndType}`
 * * `newValue: {DamageAndType}`
 * @method onDelete Callback that is invoked when delete button is clicked. 
 * Receives no arguments. 
 */
export default class DamageDefinitionListItemViewModel extends InputViewModel {
  static get TEMPLATE() { return game.strive.const.TEMPLATES.COMPONENT_DAMAGE_DEFINITION_LIST_ITEM; }

  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
   */
  static registerHandlebarsPartial() {
    Handlebars.registerPartial('damageDefinitionListItem', `{{> "${DamageDefinitionListItemViewModel.TEMPLATE}"}}`);
  }

  /**
   * Returns an array of damage type choices. 
   * 
   * @type {Array<ChoiceOption>}
   * @readonly
   */
  get damageTypeOptions() { return DAMAGE_TYPES.asChoices(); }
  
  /**
   * Returns the localization key of the deletion button hint. 
   * 
   * @type {String}
   * @readonly
   */
  get localizedDeletionHint() { return StringUtil.format(
    game.i18n.localize("system.general.delete.deleteType"),
    game.i18n.localize("system.damageDefinition.label")
  ); }

  /**
   * Returns the CSS class of the icon that represents the current damage type. 
   * 
   * @type {String}
   * @readonly
   */
  get damageTypeIconClass() {
    return getDamageTypeIconClass(this.value.damageType);
  }

  /**
   * @param {DamageAndType} args.value 
   * @param {Function} args.resolveFormula A function which resolves the damage definition's 
   * formula and returns it. 
   * @param {String | undefined} args.id Optional. Unique ID of this view model instance. 
   * @param {String | undefined} args.localizedLabel 
   * @param {Function | undefined} args.onChange Callback that is invoked 
   * when the value changes. Receives two arguments: 
   * * `oldValue: {DamageAndType}`
   * * `newValue: {DamageAndType}`
   * @param {Function | undefined} args.onDelete Callback that is invoked when delete 
   * button is clicked. Receives no arguments. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["value", "resolveFormula"]);

    this.localizedLabel = args.localizedLabel;
    this.resolveFormula = args.resolveFormula;
    this.onDelete = args.onDelete ?? (async () => {});

    const thiz = this;
    
    this.vmTfDamage = new InputTextFieldViewModel({
      parent: this,
      id: "vmTfDamage",
      value: this.value.damage,
      onChange: (_, newValue) => {
        this.value = new DamageAndType({
          damage: newValue,
          damageType: this.value.damageType,
        });
      },
    });

    this.vmDdDamageType = new InputDropDownViewModel({
      id: "vmDdDamageType",
      parent: this,
      options: this.damageTypeOptions,
      value: this.damageTypeOptions.find(it => it.value === this.value.damageType.name),
      onChange: (_, newValue) => {
        this.value = new DamageAndType({
          damage: this.value.damage,
          damageType: DAMAGE_TYPES[newValue.value],
        });
      },
    });

    this.vmBtnDelete = new ButtonViewModel({
      id: "vmBtnDelete",
      parent: thiz,
      isEditable: thiz.isEditable,
      localizedToolTip: this.localizedDeletionHint,
      iconHtml: '<i class="fas fa-trash"></i>',
      onClick: this.onDelete,
    });
  }

  /**
   * Resolves the formula and returns the result. 
   * 
   * @returns {String} A fully resolved and rollable formula. 
   * * E. g. `"5D5 + 2"`. 
   */
  resolveFormula() { throw new Error("NotImplementedException"); }
}
