import { TEMPLATES } from "../../templatePreloader.mjs";
import InputViewModel from "../../view-model/input-view-model.mjs";

/**
 * Represents a text-area input. The user can enter an arbitrary text, which can span multiple lines. 
 * 
 * @extends InputViewModel
 * 
 * @property {String} value The current value. 
 * @property {Boolean} spellcheck Gets whether spell checking is enabled. 
 * @property {String} placeholder Gets a placeholder text to display while the textfield is empty. 
 * 
 * @method onChange Callback that is invoked when the value changes. 
 * Receives the following arguments: 
 * * `oldValue: {String}`
 * * `newValue: {String}`
 */
export default class InputTextareaViewModel extends InputViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.COMPONENT_INPUT_TEXTAREA; }

  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
   */
  static registerHandlebarsPartial() {
    Handlebars.registerPartial('inputTextarea', `{{> "${InputTextareaViewModel.TEMPLATE}"}}`);
  }

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
   * @param {Object} args
   * @param {String | undefined} args.value The current value. 
   * @param {Boolean | undefined} args.spellcheck Optional. Sets whether spell checking is enabled. 
   * @param {String | undefined} args.placeholder Optional. Sets a placeholder text to display while the textfield is empty. 
   * @param {Function | undefined} args.onChange Callback that is invoked 
   * when the value changes. Receives two arguments: 
   * * `oldValue: {String}`
   * * `newValue: {String}`
   */
  constructor(args = {}) {
    super(args);

    this._value = args.value ?? "";
    this.spellcheck = args.spellcheck ?? false;
    this._placeholder = args.placeholder ?? "";
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);

    if (this.isEditable !== true) return;

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
