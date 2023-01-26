import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";
import ViewModel from "../../view-model/view-model.mjs";
import ButtonViewModel from "../button/button-viewmodel.mjs";
import ModifiersListItemViewModel from "./modifiers-list-item-viewmodel.mjs";

/**
 * Represents a list of `Modifier`s. 
 * 
 * @extends ViewModel
 * 
 * @property {Array<ModifiersListItemViewModel>} formulaViewModels
 * @property {String} propertyPath The path used to look up the value. 
 * @property {Object} propertyOwner An object on which to to look up the value. 
 * @property {Array<Modifier>} value Gets or sets the looked up value. 
 */
export default class ModifiersListViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.COMPONENT_MODIFIERS_LIST; }

  /**
   * @param {Object} args 
   * @param {String} args.propertyPath The path used to look up the value. 
   * @param {Object} args.propertyOwner An object on which to to look up the value. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["propertyOwner", "propertyPath"]);

    this.propertyOwner = args.propertyOwner;
    this.propertyPath = args.propertyPath;
    
    this.formulaViewModels = [];
    this.formulaViewModels = this._getFormulaViewModels();

    this.vmBtnAddItem = new ButtonViewModel({
      id: "vmBtnAddItem",
      parent: this,
      isEditable: this.isEditable,
      isSendable: this.isSendable,
      isOwner: this.isOwner,
    });
  }

  /** @override */
  update(args) {
    this.formulaViewModels = this._getFormulaViewModels();
    
    super.update(args);
  }

  /**
   * @returns {Array<ModifiersListItemViewModel>}
   * 
   * @private
   */
  _getFormulaViewModels() {
    // TODO #200
  }
}

Handlebars.registerPartial('modifiersList', `{{> "${ModifiersListViewModel.TEMPLATE}"}}`);
