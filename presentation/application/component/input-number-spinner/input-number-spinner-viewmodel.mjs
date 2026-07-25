import { FormulaUtility } from "../../../../common/util/formula-utility.mjs";
import { ValidationUtil } from "../../../../common/util/validation-utility.mjs";
import { TEMPLATES } from "../../templates.mjs";
import InputViewModel from "../../view-model/input-view-model.mjs";

/**
 * Represents a number-spinner input. 
 * 
 * The user can input a number directly, or increment/decrement via buttons or the scroll wheel. 
 * 
 * @extends InputViewModel
 * 
 * @property {String | undefined} localizedToolTip A localized text to 
 * display as a tool tip. 
 * 
 * @property {Number} value The current value. 
 * @property {Number | undefined} min Gets the minimum value. 
 * @property {Number | undefined} max Gets the maximum value. 
 * @property {Boolean} hasMin Returns true, if the minimum value is defined. 
 * * Read-only
 * @property {Boolean} hasMax Returns true, if the maximum value is defined. 
 * * Read-only
 * @property {Number} step Gets the increment/decrement step size. 
 * 
 * @method onChange Callback that is invoked when the value changes. 
 * Receives the following arguments: 
 * * `oldValue: {Number}`
 * * `newValue: {Number}`
 */
export default class InputNumberSpinnerViewModel extends InputViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.application.component.numberSpinner; }

  /** @override */
  get clazz() { return InputNumberSpinnerViewModel; }

  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
   */
  static registerHandlebarsPartial() {
    Handlebars.registerPartial('inputNumberSpinner', `{{> "${InputNumberSpinnerViewModel.TEMPLATE}"}}`);
  }

  /** @override */
  get value() { return parseInt(this._value); }
  /**
   * @param {String | Number} newValue The new value to set.
   * Supports integer numbers and arithmetic formulae, e. g.
   * `"33 - (7 / 2)"`
   * @override
   */
  set value(newValue) {
    let parsedValue = NaN;
    try {
      parsedValue = FormulaUtility.eval(newValue);
    } catch (error) {
      // TODO: pop-up
    }

    const oldValue = this._value;
    if (parsedValue === NaN)
      this._value = this.hasMin ? this.min : 0;
    else if (this.hasMin && parsedValue < this.min)
      this._value = this.min;
    else if (this.hasMax && parsedValue > this.max)
      this._value = this.max;
    else
      this._value = parsedValue;

    this.onChange(oldValue, this._value);

    // Update visuals. 

    this.inputElement[0].value = this._value + "";

    const readModeElement = this.element.find(".read-mode");
    readModeElement.empty();
    readModeElement.append(this._value);
  }

  /**
   * Returns true, if the minimum value is defined. 
   * @type {Boolean}
   * @readonly
   */
  get hasMin() { return ValidationUtil.isDefined(this.min); }
  /**
   * Returns true, if the maximum value is defined. 
   * @type {Boolean}
   * @readonly
   */
  get hasMax() { return ValidationUtil.isDefined(this.max); }

  /**
   * @type {Number}
   */
  get min() { return this._min; }
  /**
   * @param {Number} value
   */
  set min(value) {
    this._min = value;
    if (this._value < this._min) {
      this._value = this._min;
    }
  }

  /**
   * @type {Number}
   */
  get max() { return this._max; }
  /**
   * @param {Number} value
   */
  set max(value) {
    this._max = value;
    if (this._value > this._max) {
      this._value = this._max;
    }
  }

  /**
   * @type {Number}
   */
  get step() { return this._step; }
  /**
   * @param {Number} value
   */
  set step(value) { this._step = value; }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * @param {Boolean | undefined} args.isEditable If `true`, input(s) will 
   * be in edit mode. If `false`, will be in read-only mode.
   * * default `false`. 
   * @param {ViewModelToolTipDefinition | undefined} args.toolTip Creates a tool tip definition.
   * 
   * @param {Any | undefined} args.value The current value. 
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
   * @param {Number | undefined} args.min Optional. The minimum value. 
   * @param {Number | undefined} args.max Optional. The maximum value. 
   * @param {Number | undefined} args.step Optional. The increment/decrement step size. 
   * * default `1`
   * @param {Function | undefined} args.onChange Callback that is invoked 
   * when the value changes. Receives two arguments: 
   * * `oldValue: {Number}`
   * * `newValue: {Number}`
   */
  constructor(args = {}) {
    super(args);

    this._value = args.value ?? 0;
    this._min = args.min ?? undefined;
    this._max = args.max ?? undefined;
    this._step = args.step ?? 1;
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);

    this.element.find(".button-spinner.up").click(this._onIncrement.bind(this));
    this.element.find(".button-spinner.down").click(this._onDecrement.bind(this));

    this.inputElement.on("keydown", (event) => {
      if (event.key === "ArrowUp") {
        event.preventDefault();
        this._onIncrement();
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        this._onDecrement();
      }
    });
    this.inputElement.on("mousewheel", (event) => {
      if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
        // Scrolled up.
        event.preventDefault();
        this._onIncrement();
      } else {
        // Scrolled down.
        event.preventDefault();
        this._onDecrement();
      }
    });
  }

  /**
   * Increases the current value by `this._step`. 
   * @param {Event} event 
   * @private
   */
  _onIncrement(event) {
    const newValue = parseInt(this.value) + this._step;
    this.value = newValue;
  }

  /**
   * Decreases the current value by `this._step`. 
   * @param {Event} event 
   * @private
   */
  _onDecrement(event) {
    const newValue = parseInt(this.value) - this._step;
    this.value = newValue;
  }
}
