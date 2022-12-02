import { TEMPLATES } from "../../templatePreloader.mjs";
import { validateOrThrow } from "../../utils/validation-utility.mjs";
import InputViewModel from "../input-viewmodel.mjs";
import ViewModelTypeDefinition from "../../view-model/view-model-type-definition.mjs";
import { VIEW_MODEL_TYPE } from "../../view-model/view-model-type.mjs";

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
 * @property {Boolean} spellcheck Gets whether spell checking is enabled. 
 * 
 */
export default class InputTextareaViewModel extends InputViewModel {
  static get TEMPLATE() { return TEMPLATES.COMPONENT_INPUT_TEXTAREA; }

  /**
   * @type {String}
   * @private
   */
  _placeholder = "";
  /**
   * The placeholder text to display when the input has no value. 
   * @type {String}
   * @readonly
   */
  get placeholder() { return this._placeholder; }

  /**
   * Returns the localized placeholder. 
   * @type {String}
   * @readonly
   */
  get localizedPlaceholder() { return (this._placeholder !== undefined && this._placeholder !== null) ? game.i18n.localize(this._placeholder) : ""; }
  
  /**
   * @param {String | undefined} args.id Optional. Unique ID of this view model instance. 
   * 
   * @param {String} args.propertyPath The path used to look up the value. 
   * @param {Object} args.propertyOwner An object on which to to look up the value. 
   * @param {Boolean | undefined} args.isEditable Optional. If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
   * @param {String | undefined} args.contextTemplate Optional. Name or path of a template that embeds this input component. 
   * @param {String | undefined} args.localizableTitle Optional. The localizable title (tooltip). 
   * 
   * @param {String | undefined} args.placeholder Optional. Sets a placeholder text to display while the textfield is empty. 
   * @param {Boolean | undefined} args.spellcheck Optional. Sets whether spell checking is enabled. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["propertyPath", "propertyOwner"]);

    this._placeholder = args.placeholder ?? "";
    this.spellcheck = args.spellcheck ?? false;
  }

  /** @override */
  activateListeners(html, isOwner, isEditable) {
    super.activateListeners(html, isOwner, isEditable);

    this.element.each(function() {
      // This counter-acts a rather bothersome quirk of Handlebars. Turns out, if a partial containing a 
      // textarea is indented, or if any of the partials that contain the textarea containing 
      // partial is indented, spaces respective to the indentation level are suffixed to _every_ 
      // line break in the text area.
      // 
      // Of course, this work-around has a bothersome caveat: users cannot use spaces after a 
      // new line as a formatting tool. 
      this.value = this.value.replaceAll(/\n +/g, "\n");
    });

    // Ensure height is adjusted on edit. 
    this.element.on("input", function() {
      this.nextElementSibling.textContent = this.value;
    });
  }
}

Handlebars.registerPartial('inputTextarea', `{{> "${InputTextareaViewModel.TEMPLATE}"}}`);

VIEW_MODEL_TYPE.set(
  "InputTextareaViewModel", 
  new ViewModelTypeDefinition(
    (args) => { return new InputTextareaViewModel(args); },
    ["propertyOwner", "propertyPath", "localizableTitle", "placeholder", "spellcheck"]
  )
);
