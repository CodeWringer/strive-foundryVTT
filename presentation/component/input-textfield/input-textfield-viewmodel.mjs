import { TEMPLATES } from "../../templatePreloader.mjs";
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
  static get TEMPLATE() { return TEMPLATES.COMPONENT_INPUT_TEXTFIELD; }

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
   * @param {Boolean | undefined} args.isEditable If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
   * 
   * @param {String | undefined} args.value The current value. 
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
}
