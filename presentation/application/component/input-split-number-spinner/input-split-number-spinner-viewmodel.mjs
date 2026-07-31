import { SlideDisplaceAnim } from "../../../animation/slide-displace-anim.mjs";
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

  /** @override */
  get inputElement() { return undefined; }

  /**
   * Gets or sets the edit-mode of the control. 
   * 
   * When setting, it will also toggle between edit-mode and read-mode, in the DOM. 
   * @type {Boolean}
   * @override
   */
  get isEditable() { return super.isEditable; }
  set isEditable(value) {
    // set super.isEditable should not be called! 
    // It would prevent selectively enabling children. 

    this._isEditable = value;

    if (value) {
      if (this._allowEditingCurrent) {
        this.vmCurrent.isEditable = value;
      }
      if (this._allowEditingMaximum) {
        this.vmMaximum.isEditable = value;
      }
    }

    const editElement = this.element.find("> .edit-mode");
    const readElement = this.element.find("> .read-mode");
    if (value) {
      new SlideDisplaceAnim({
        displacingElement: editElement,
        displacedElement: readElement,
      }).execute();
    } else {
      new SlideDisplaceAnim({
        displacingElement: readElement,
        displacedElement: editElement,
      }).execute();
    }
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
        if (this._isCurrentLimitedByMax && newValue < this.value.current) {
          this.vmCurrent.value = newValue;
        }
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
    const oldValue = this._value;
    this._value = {
      current: (newValue ?? {}).current ?? this._value.current,
      maximum: (newValue ?? {}).maximum ?? this._value.maximum,
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
   * @param {Boolean | undefined} args.suppressAnims If `true`, suppresses animations that would play when 
   * `isEditable` is changed at run-time. Useful for when this component is child to another, which 
   * instead handles the animations. 
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
   * @param {Boolean | undefined} args.current.limitToMax If `true` the current value will 
   * be limited to be at most the max value. 
   * * default `false`
   * @param {Number | undefined} args.current.step
   * @param {Boolean | undefined} args.current.allowEditing If `true` will allow editing 
   * the current value when the control is in edit-mode. 
   * * default `true`
   * 
   * @param {Object | undefined} args.maximum
   * @param {Number | undefined} args.maximum.value
   * @param {Number | undefined} args.maximum.min
   * @param {Number | undefined} args.maximum.max
   * @param {Number | undefined} args.maximum.step
   * @param {Boolean | undefined} args.maximum.allowEditing If `true` will allow editing 
   * the maximum value when the control is in edit-mode. 
   * * default `true`
   */
  constructor(args = {}) {
    super({
      ...args,
      value: {
        current: (args.current ?? {}).value ?? 0,
        maximum: (args.maximum ?? {}).value ?? 0,
      },
    });

    const current = args.current ?? {};
    const maximum = args.maximum ?? {};

    this._allowEditingCurrent = current.allowEditing ?? true;
    this._allowEditingMaximum = maximum.allowEditing ?? true;
    this._isCurrentLimitedByMax = current.limitToMax ?? false;

    this.vmCurrent = new InputNumberSpinnerViewModel({
      id: "vmCurrent",
      parent: this,
      value: this._value.current,
      onChange: (_, newValue) => {
        this.value.current = newValue;
      },
      min: current.min,
      step: current.step,
      suppressAnims: true,
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
        if (this._isCurrentLimitedByMax && this.value.maximum < this.value.current) {
          this.vmCurrent.value = this.value.maximum;
        }
      },
      min: maximum.min,
      max: maximum.max,
      step: maximum.step,
      suppressAnims: true,
      onInput: this.onInput,
      onFocus: this.onFocus,
      onFocusLost: this.onFocusLost,
    });
  }
}
