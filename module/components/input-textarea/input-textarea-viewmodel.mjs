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
 * @property {Boolean} allowResize Gets whether resizing is allowed. 
 * @property {Boolean} spellcheck Gets whether spell checking is enabled. 
 * @property {String} placeholder Gets a placeholder text to display while the textfield is empty. 
 * 
 */
export default class InputTextareaViewModel extends InputViewModel {
  static get TEMPLATE() { return TEMPLATES.COMPONENT_INPUT_TEXTAREA; }

  /**
   * @param {String | undefined} args.id
   * 
   * @param {Boolean | undefined} args.isEditable 
   * @param {String} args.propertyPath
   * @param {Object} args.propertyOwner
   * @param {String | undefined} contextTemplate
   * 
   * @param {Boolean} args.allowResize 
   * @param {Boolean} args.spellcheck 
   * @param {String} args.placeholder 
   */
  constructor(args = {}) {
    super(args);
    this.allowResize = args.allowResize ?? false;
    this.spellcheck = args.spellcheck ?? false;
    this.placeholder = args.placeholder ?? "";
  }
}

Handlebars.registerHelper('createInputTextareaViewModel', function(isEditable, propertyOwner, propertyPath, placeholder, allowResize, spellcheck, contextTemplate) {
  const vm = new InputTextareaViewModel({
    isEditable: isEditable,
    propertyOwner: propertyOwner,
    propertyPath: propertyPath,
    allowResize: allowResize,
    spellcheck: spellcheck,
    placeholder: placeholder,
    contextTemplate: contextTemplate,
  });

  // Add new view model instance to global collection. 
  game.ambersteel.viewModels.set(vm.id, vm);

  return vm;
});
Handlebars.registerPartial('_inputTextarea', `{{#> "${InputTextareaViewModel.TEMPLATE}"}}{{/"${InputTextareaViewModel.TEMPLATE}"}}`);
Handlebars.registerPartial('inputTextarea', `{{> _inputTextarea vm=(createInputTextareaViewModel isEditable propertyOwner propertyPath placeholder allowResize spellcheck contextTemplate) cssClass=(isDefined cssClass "") readOnlyCssClass=(isDefined readOnlyCssClass "") }}`);
