import { TEMPLATES } from "../../templates.mjs";
import InputViewModel from "../../view-model/input-view-model.mjs";
import InputNumberSpinnerViewModel from "../input-number-spinner/input-number-spinner-viewmodel.mjs";

/**
 * @extends InputViewModel
 */
export default class InputSplitNumberSpinnerViewModel extends InputViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.application.component.splitNumberSpinner; }

  /** @override */
  get clazz() { return InputSplitNumberSpinnerViewModel; }

  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
   */
  static registerHandlebarsPartial() {
    Handlebars.registerPartial('inputSplitNumberSpinner', `{{> "${InputSplitNumberSpinnerViewModel.TEMPLATE}"}}`);
  }

  /**
   * Returns an object with current and maximum value, which are accessors 
   * and can be used to update the value's individual components. 
   * * `current: Number`
   * * `maximum: Number`
   * @type {Object}
   */
  get value() {
    const thiz = this;
    return {
      /**
       * @type {Number}
       */
      get current() { return thiz._value.current; },
      set current(newValue) {
        const oldValue = thiz._value;
        thiz._value.current = newValue;
        thiz.onChange(oldValue, thiz._value);
      },
      
      /**
       * @type {Number}
       */
      get maximum() { return thiz._value.maximum; },
      set maximum(newValue) {
        const oldValue = thiz._value;
        thiz._value.maximum = newValue;
        thiz.onChange(oldValue, thiz._value);
      },
    };
  }
  /**
   * @param {Object | undefined} newValue 
   * @param {Number | undefined} newValue.current 
   * @param {Number | undefined} newValue.maximum 
   */
  set value(newValue) {
    const oldValue = thiz._value;
    this._value = {
      current: (newValue ?? {}).current ?? this._value.current,
      current: (newValue ?? {}).maximum ?? this._value.maximum,
    };
    this.onChange(oldValue, this._value);
  }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * @param {Boolean | undefined} args.isEditable If `true`, input(s) will 
   * be in edit mode. If `false`, will be in read-only mode.
   * * default `false`. 
   * @param {ViewModelToolTipDefinition | undefined} args.toolTip Creates a tool tip definition.
   * 
   * @param {Function | undefined} args.onChange Callback that is invoked 
   * when the value changes. Receives two arguments: 
   * * `oldValue: {Any}`
   * * `newValue: {Any}`
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
   * @param {Object | undefined} args.current
   * @param {Number | undefined} args.current.value
   * @param {Number | undefined} args.current.min
   * @param {Number | undefined} args.current.max
   * @param {Number | undefined} args.current.step
   * 
   * @param {Object | undefined} args.maximum
   * @param {Number | undefined} args.maximum.value
   * @param {Number | undefined} args.maximum.min
   * @param {Number | undefined} args.maximum.max
   * @param {Number | undefined} args.maximum.step
   */
  constructor(args = {}) {
    super({
      ...args,
      value: {
        current: (args.current ?? {}).value ?? 0,
        maximum: (args.maximum ?? {}).value ?? 0,
      },
    });

    this.vmCurrent = new InputNumberSpinnerViewModel({
      id: "vmCurrent",
      parent: this,
      value: this._value.current,
      onChange: (_, newValue) => {
        this.value.current = newValue;
      },
      onInput: this.onInput,
      onFocus: this.onFocus,
      onFocusLost: this.onFocusLost,
    });
    this.vmMaximum = new InputNumberSpinnerViewModel({
      id: "vmMaximum",
      parent: this,
      value: this._value.maximum,
      onChange: (_, newValue) => {
        this.value.maximum = newValue;
      },
      onInput: this.onInput,
      onFocus: this.onFocus,
      onFocusLost: this.onFocusLost,
    });
  }
}
