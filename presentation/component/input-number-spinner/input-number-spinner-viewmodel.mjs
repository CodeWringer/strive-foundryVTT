import { SheetUtil } from "../../sheet/sheet-utility.mjs";
import InputViewModel from "../../view-model/input-view-model.mjs";

/**
 * Represents a number-spinner input. 
 * 
 * The user can input a number directly, or increment/decrement via buttons or the scroll wheel. 
 * 
 * @extends InputViewModel
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
  static get TEMPLATE() { return game.strive.const.TEMPLATES.COMPONENT_INPUT_NUMBER_SPINNER; }

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
  /** @override */
  set value(newValue) {
    const oldValue = this._value;
    this._value = parseInt(newValue);
    this.onChange(oldValue, this._value);
  }

  /**
   * Returns true, if the minimum value is defined. 
   * @type {Boolean}
   * @readonly
   */
  get hasMin() { return this.min !== undefined; }
  /**
   * Returns true, if the maximum value is defined. 
   * @type {Boolean}
   * @readonly
   */
  get hasMax() { return this.max !== undefined; }

  /**
   * @type {Number}
   */
  get min() { return this._min; }
  /**
   * @param {Number} value
   */
  set min(value) {
    this._min = value;
    $(this.element).attr("min", value);
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
    $(this.element).attr("max", value);
  }

  /**
   * @type {Number}
   */
  get step() { return this._step; }
  /**
   * @param {Number} value
   */
  set step(value) {
    this._step = value;
    $(this.element).attr("step", value);
  }

  /**
   * @param {Object} args
   * @param {Number | undefined} args.value The current value. 
   * * default `0`
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

    if (this.isEditable !== true) return;

    this.element.parent().find(".button-spinner-up").click(this._onClickNumberSpinnerUp.bind(this));
    this.element.parent().find(".button-spinner-down").click(this._onClickNumberSpinnerDown.bind(this));
  }

  /**
   * Callback for when the "up" arrow is clicked. 
   * 
   * @param {Event} event 
   * 
   * @private
   */
  _onClickNumberSpinnerUp(event) {
    const newValue = parseInt(this.value) + 1;
    if (this.max !== undefined && newValue > this.max) return;
    
    SheetUtil.setElementValue(this.element, newValue);
    this.value = newValue;
  }

  /**
   * Callback for when the "down" arrow is clicked. 
   * 
   * @param {Event} event 
   * 
   * @private
   */
  _onClickNumberSpinnerDown(event) {
    const newValue = parseInt(this.value) - 1;
    if (this.min !== undefined && newValue < this.min) return;
    
    SheetUtil.setElementValue(this.element, newValue);
    this.value = newValue;
  }
}
