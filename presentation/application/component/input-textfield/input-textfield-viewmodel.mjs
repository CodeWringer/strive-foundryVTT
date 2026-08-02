import { ValidationUtil } from "../../../../common/util/validation-utility.mjs";
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
   * Returns the current value. 
   * 
   * @type {Any}
   */
  get value() { return this._value; }
  /**
   * Sets the current value. 
   * 
   * @param {Any} newValue
   */
  set value(newValue) {
    if (this.isDisposed) return;

    const oldValue = this._value;
    this._value = newValue;

    let readElement;
    if (this.isReadModeClickable) {
      readElement = this.element.find("> .read-mode > a");
    } else {
      readElement = this.element.find("> .read-mode");
    }
    readElement.html(newValue);

    this.inputElement.val(newValue);

    this.onChange(oldValue, newValue);
  }

  get isReadModeClickable() { return ValidationUtil.isDefined(this.onClick); }

  /**
   * @param {Object} args 
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * @param {ViewModel | undefined} args.parent Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
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
   * @param {Function | undefined} args.onClickInReadMode Invoked when clicking on the text displayed 
   * in read-mode. 
   */
  constructor(args = {}) {
    super(args);

    this._value = args.value ?? "";
    this.placeholder = args.placeholder ?? "";
    this.onClick = args.onClickInReadMode;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Ensure the correct value is displayed. 
    this.inputElement.attr("value", this.value);

    this.element.find("> .read-mode > a").click(() => {
      if (this.isReadModeClickable) {
        this.onClick();
      }
    });
  }
}
