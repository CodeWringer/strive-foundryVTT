import { StringUtil } from "../../../../common/util/string-utility.mjs";
import { ValidationUtil } from "../../../../common/util/validation-utility.mjs";
import { TEMPLATES } from "../../templates.mjs";
import InputViewModel from "../../view-model/input-view-model.mjs";
import { ViewModelToolTipDefinition } from "../../view-model/view-model.mjs";
import ButtonViewModel from "../button/button-viewmodel.mjs";

/**
 * Represents a text input. The user can enter an arbitrary text, but only in a single line. 
 * 
 * @extends InputViewModel
 * 
 * @property {String} value The current value. 
 * @property {String} placeholder A localized placeholder text to display while the textfield is empty. 
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
   * @type {String}
   */
  get value() { return super.value; }
  /**
   * Sets the current value. 
   * 
   * @param {String} newValue
   */
  set value(newValue) {
    if (this.isDisposed) return;

    super.value = newValue;

    let readElement = this.element.find("> .read-mode");
    readElement.html(newValue);

    this.inputElement.val(newValue);

    if (this.enableClearButton && ValidationUtil.isBlankOrUndefined(newValue)) {
      this.vmClear.visible = false;
    }
  }

  get enableClearButton() { return this._enableClearButton ?? false; }
  set enableClearButton(value) {
    this._enableClearButton = value;

    const val = this.inputElement.val();
    if (value && !ValidationUtil.isBlankOrUndefined(val)) {
      this.vmClear.visible = true;
    }
  }

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
   * @param {Boolean | undefined} args.autoHandleEvents If `true`, will automatically attach 
   * event listeners for the input element. This behavior may be undesirable by some inheritors, 
   * which can disable it by setting this to `false`. 
   * * default `true`
   * @param {Any | undefined} args.value The current value. 
   * @param {Boolean | undefined} args.suppressAnims If `true`, suppresses animations that would play when 
   * `isEditable` is changed at run-time. Useful for when this component is child to another, which 
   * instead handles the animations. 
   * @param {Function | undefined} args.onChange Callback that is invoked 
   * when the value changes. Receives two arguments: 
   * * `newValue: {Any}`
   * * `oldValue: {Any}`
   * @param {Function | undefined} args.onInput Callback that is invoked when any input is made (by keyboard or mouse or other input device). 
   * * `event: {Event}`
   * * `viewModel: {ViewModel}`
   * @param {Function | undefined} args.onFocus Callback that is invoked when the input element is focused. 
   * * `event: {Event}`
   * * `viewModel: {ViewModel}`
   * @param {Function | undefined} args.onFocusLost Callback that is invoked when the input element is unfocused. 
   * * `event: {Event}`
   * * `viewModel: {ViewModel}`
   * 
   * @param {String | undefined} args.icon Icon HTML to display in the text field. 
   * @param {String | undefined} args.enableClearButton If `true`, when there is content in the text field, 
   * it will display a button to quickly clear the current value. 
   * * default `false`
   */
  constructor(args = {}) {
    super({
      ...args,
      value: args.value ?? "",
    });

    this.placeholder = args.placeholder ?? "";
    this.icon = args.icon;
    this._enableClearButton = args.enableClearButton ?? false;

    this.vmClear = new ButtonViewModel({
      id: "vmClear",
      parent: this,
      content: '<i class="fas fa-times"></i>',
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.general.clearCurrentValue"),
      }),
      onClick: () => {
        this.value = "";
      },
    });
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Ensure the correct value is displayed. 
    this.inputElement.attr("value", this.value);

    // Ensure initial clear button visibility. 
    if (this.enableClearButton && !ValidationUtil.isBlankOrUndefined(this.value)) {
      this.vmClear.visible = true;
    } else {
      this.vmClear.visible = false;
    }
  }

  /** @override */
  _onInput() {
    super._onInput();

    // Ensure clear button visibility.
    if (this.enableClearButton) {
      const val = this.inputElement.val();
      if (!ValidationUtil.isBlankOrUndefined(val)) {
        this.vmClear.visible = true;
      } else {
        this.vmClear.visible = false;
      }
    }
  }
}
