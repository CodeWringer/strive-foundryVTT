import { ValidationUtil } from "../../business/util/validation-utility.mjs";
import { SheetUtil } from "../sheet/sheet-utility.mjs";
import ViewModel from "./view-model.mjs";

/**
 * Constant that defines the css class to look for when identifying input elements for editing. 
 * @constant
 */
export const SELECTOR_EDIT = "custom-system-edit";
/**
 * Constant that defines the css class to look for when identifying input elements for display. 
 * @constant
 */
export const SELECTOR_READ = "custom-system-read-only";

/**
 * Represents the basis for all input type view models. 
 * 
 * @extends ViewModel
 * 
 * @property {String} id Unique ID of this view model instance. 
 * @property {Boolean} isEditable If `true`, input(s) will 
 * be in edit mode. If `false`, will be in read-only mode.
 * @property {JQuery | HTMLElement} element The DOM element that is 
 * associated with this view model. 
 * * Read-only
 * @property {String | undefined} localizedToolTip A localized text to 
 * display as a tool tip. 
 * 
 * @property {String | undefined} iconHtml Raw HTML to render as 
 * an associated icon. E. g. `'<i class="fas fa-scroll"></i>'`
 * @property {Any | undefined} value The current value. 
 * * Upon change, invokes the `onChange` callback. 
 * @property {String} localizedValue The current value, localized. 
 * * Read-only
 * 
 * @method onChange Callback that is invoked when the value changes. 
 * Receives the following arguments: 
 * * `oldValue: {Any}`
 * * `newValue: {Any}`
 * @method onInput Callback that is invoked when any input is made (by keyboard or mouse or other input device). 
 * * `event: {Event}`
 * * `viewModel: {ViewModel}`
 */
export default class InputViewModel extends ViewModel {

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
    const oldValue = this._value;
    this._value = newValue;
    this.onChange(oldValue, newValue);
  }

  /**
   * The current value, localized. 
   * 
   * @type {String}
   * @readonly
   */
  get localizedValue() {
    const value = this.value;
    return (value !== undefined && value !== null) ? game.i18n.localize(`${value}`) : value;
  }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * @param {Boolean | undefined} args.isEditable If `true`, input(s) will 
   * be in edit mode. If `false`, will be in read-only mode.
   * * default `false`. 
   * @param {String | undefined} args.localizedToolTip A localized text to 
   * display as a tool tip. 
   * 
   * @param {String | undefined} args.iconHtml Raw HTML to render as 
   * an associated icon. E. g. `'<i class="fas fa-scroll"></i>'`
   * @param {Any | undefined} args.value The current value. 
   * @param {Function | undefined} args.onChange Callback that is invoked 
   * when the value changes. Receives two arguments: 
   * * `oldValue: {Any}`
   * * `newValue: {Any}`
   * @param {Function | undefined} args.onInput Callback that is invoked when any input is made (by keyboard or mouse or other input device). 
   * * `event: {Event}`
   * * `viewModel: {ViewModel}`
   */
  constructor(args = {}) {
    super(args);

    this.iconHtml = args.iconHtml;
    this._value = args.value;
    this.onChange = args.onChange ?? (() => {});
    this.onInput = args.onInput ?? (() => {});
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);

    if (this.isEditable !== true) return;

    this.element.change(this._onChange.bind(this));
    this.element.on("input", this._onInput.bind(this));
  }
  
  /** @override */
  dispose() {
    this.onChange = null;

    super.dispose();
  }

  /**
   * Internal callback for the value change. 
   * 
   * @param {Event} event 
   * 
   * @protected
   */
  _onChange(event) {
    const newValue = SheetUtil.getElementValue(event.currentTarget);

    if (ValidationUtil.isDefined(newValue) !== true) {
      game.strive.logger.logWarn(`Failed to get element's value - is '${newValue}' valid?`);
    }

    this.value = newValue;
  }

  /**
   * Internal callback for onInput. 
   * 
   * @param {Event} event 
   * 
   * @protected
   */
  _onInput(event) {
    this.onInput(event, this);
  }
}
