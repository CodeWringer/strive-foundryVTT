import { TEMPLATES } from "../../templates.mjs";
import InputViewModel from "../../view-model/input-view-model.mjs";

/**
 * Represents a text input. The user can enter an arbitrary text, but only in a single line. 
 * 
 * @extends InputViewModel
 * 
 * @property {String} value The current value. 
 * @property {String} placeholder A localized placeholder text to display while the textfield is empty. 
 * 
 * @method onChange Callback that is invoked when the value changes. 
 * Receives the following arguments: 
 * * `oldValue: {String}`
 * * `newValue: {String}`
 */
export default class InputTextFieldViewModel extends InputViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.application.component.textField; }

  /** @override */
  get clazz() { return InputTextFieldViewModel; }
  
  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
   */
  static registerHandlebarsPartial() {
    Handlebars.registerPartial('inputTextField', `{{> "${InputTextFieldViewModel.TEMPLATE}"}}`);
  }

  /**
   * @param {Object} args 
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * @param {Boolean | undefined} args.isEditable If `true`, input(s) will 
   * be in edit mode. If `false`, will be in read-only mode.
   * * default `false`. 
   * @param {ViewModelToolTipDefinition | undefined} args.toolTip Creates a tool tip definition.
   * 
   * display as a tool tip. 
   * @param {String | undefined} args.value The current value. 
   * @param {Boolean | undefined} args.suppressAnims If `true`, suppresses animations that would play when 
   * `isEditable` is changed at run-time. Useful for when this component is child to another, which 
   * instead handles the animations. 
   * @param {String | undefined} args.placeholder A placeholder text to display while the textfield is empty. 
   * @param {Function | undefined} args.onChange Callback that is invoked 
   * when the value changes. Receives two arguments: 
   * * `oldValue: {String}`
   * * `newValue: {String}`
   */
  constructor(args = {}) {
    super(args);

    this._value = args.value ?? "";
    this.placeholder = args.placeholder ?? "";
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Ensure the correct value is displayed. 
    this.inputElement.attr("value", this.value);
  }
}
