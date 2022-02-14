import { TEMPLATES } from "../../templatePreloader.mjs";
import InputViewModel from "../input-viewmodel.mjs";

/**
 * --- Inherited from ViewModel
 * 
 * @property {Boolean} isEditable If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
 * @property {String} id Optional. Id used for the HTML element's id and name attributes. 
 * @property {String} template Static. Returns the template this ViewModel is intended for. 
 * 
 * --- Inherited from InputViewModel
 * 
 * @property {String} propertyPath The path used to look up the value. 
 * @property {Object} propertyOwner An object on which to to look up the value. 
 * @property {Any} value Gets or sets the looked up value. 
 * 
 * --- Own properties
 * 
 * @property {String} placeholder Gets a placeholder text to display while the textfield is empty. 
 */
export default class InputTextFieldViewModel extends InputViewModel {
  static get template() { return TEMPLATES.COMPONENT_INPUT_TEXTFIELD; }

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
   * @param {Boolean | undefined} args.isEditable 
   * @param {String | undefined} args.id
   * @param {String} args.propertyPath
   * @param {Object} args.propertyOwner
   * @param {String} args.placeholder
   */
  constructor(args = {}) {
    super(args);
    args = {
      placeholder: "",
      ...args,
    }
    this._placeholder = args.placeholder;
  }
}

Handlebars.registerHelper('createInputTextFieldViewModel', function(isEditable, propertyOwner, propertyPath, localizablePlaceholder) {
  const vm = new InputTextFieldViewModel({
    isEditable: isEditable,
    propertyOwner: propertyOwner,
    propertyPath: propertyPath,
    placeholder: game.i18n.localize(localizablePlaceholder)
  });
  
  // Add new view model instance to global collection. 
  game.ambersteel.viewModels.set(vm.id, vm);
  
  return vm;
});
Handlebars.registerPartial('_inputTextField', `{{#> "${TEMPLATES.COMPONENT_INPUT_TEXTFIELD}"}}{{/"${TEMPLATES.COMPONENT_INPUT_TEXTFIELD}"}}`);
Handlebars.registerPartial('inputTextField', `{{> _inputTextField vm=(createInputTextFieldViewModel isEditable propertyOwner propertyPath placeholder) cssClass=(isDefined cssClass "") readOnlyCssClass=(isDefined readOnlyCssClass "") }}`);
