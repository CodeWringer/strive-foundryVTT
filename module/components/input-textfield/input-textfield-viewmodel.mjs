import { TEMPLATES } from "../../templatePreloader.mjs";
import InputViewModel from "../input-viewmodel.mjs";

/**
 * --- Inherited from ViewModel
 * 
 * @property {Boolean} isEditable If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
 * @property {String} id Optional. Id used for the HTML element's id and name attributes. 
 * @property {String} TEMPLATE Static. Returns the template this ViewModel is intended for. 
 * 
 * --- Inherited from InputViewModel
 * 
 * @property {JQuery | HTMLElement} element The button element on the DOM. 
 * @property {String} propertyPath The path used to look up the value. 
 * @property {Object} propertyOwner An object on which to to look up the value. 
 * @property {Any} value Gets or sets the looked up value. 
 * 
 * --- Own properties
 * 
 * @property {String} placeholder Gets a placeholder text to display while the textfield is empty. 
 */
export default class InputTextFieldViewModel extends InputViewModel {
  static get TEMPLATE() { return TEMPLATES.COMPONENT_INPUT_TEXTFIELD; }

  /**
   * @type {String}
   * @private
   */
  _placeholder = "";
  /**
   * @type {String}
   * @readonly
   */
  get placeholder() { return this._placeholder; }

  /**
   * @param {String | undefined} args.id
   * 
   * @param {Boolean | undefined} args.isEditable 
   * @param {String} args.propertyPath
   * @param {Object} args.propertyOwner
   * @param {String | undefined} args.contextTemplate
   * 
   * @param {String} args.placeholder
   */
  constructor(args = {}) {
    super(args);
    this._placeholder = args.placeholder ?? "";
  }
}

Handlebars.registerHelper('createTextFieldViewModel', function(id, isEditable, propertyOwner, propertyPath, localizablePlaceholder, contextTemplate) {
  return new InputTextFieldViewModel({
    id: id,
    isEditable: isEditable,
    propertyOwner: propertyOwner,
    propertyPath: propertyPath,
    placeholder: game.i18n.localize(localizablePlaceholder),
    contextTemplate: contextTemplate,
  });
});
Handlebars.registerPartial('inputTextField', `{{> "${InputTextFieldViewModel.TEMPLATE}"}}`);
