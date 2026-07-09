import { ValidationUtil } from "../../../common/util/validation-utility.mjs";
import { AnimationUtil } from "../../util/anim-utility.mjs";
import { SheetUtil } from "../../util/sheet-utility.mjs";
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
 * @abstract Inheritors MUST implement:
 * * `static get TEMPLATE`
 * * `get clazz`
 * 
 * Inheritors _should_ override:
 * * `get inputElement`
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
 * @property {Any | undefined} value The current value. 
 * * Upon change, invokes the `onChange` callback. 
 * 
 * @method onChange Callback that is invoked when the value changes. 
 * Receives the following arguments: 
 * * `oldValue: {Any}`
 * * `newValue: {Any}`
 * @method onInput Callback that is invoked when any input is made (by keyboard or mouse or other input device). 
 * * `event: {Event}`
 * * `viewModel: {ViewModel}`
 * @method onFocus Callback that is invoked when the input element is focused. 
 * * `event: {Event}`
 * * `viewModel: {ViewModel}`
 * @method onFocusLost Callback that is invoked when the input element is unfocused. 
 * * `event: {Event}`
 * * `viewModel: {ViewModel}`
 */
export default class InputViewModel extends ViewModel {
  /**
   * Gets or sets the edit-mode of the control. 
   * 
   * When setting, it will also toggle between edit-mode and read-mode, in the DOM. 
   * @type {Boolean}
   * @override
   */
  get isEditable() { return super.isEditable; }
  set isEditable(value) {
    super.isEditable = value;

    const editElement = this.element.find(".edit-mode");
    const readElement = this.element.find(".read-mode");
    if (value) {
      AnimationUtil.slideDisplace({
        enteringElements: [editElement],
        exitingElements: [readElement],
      });
    } else {
      AnimationUtil.slideDisplace({
        enteringElements: [readElement],
        exitingElements: [editElement],
      });
    }
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
    this.onChange(oldValue, newValue);
  }

  /**
   * Returns the actual input element, which may be nested within `this.element`. 
   * @type {JQuery | HTMLElement}
   * @readonly
   * @virtual
   */
  get inputElement() { return ""; }

  /**
   * Set to `true` when updating the value without wanting events to fire. 
   * 
   * This is intended to prevent infinite circular onChange invocations. For use by inheritors 
   * who want to update the displayed value, but without triggering callbacks. 
   * @type {Boolean}
   * @protected
   */
  _suppressEvent = false;

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * @param {Boolean | undefined} args.isEditable If `true`, input(s) will 
   * be in edit mode. If `false`, will be in read-only mode.
   * * default `false`. 
   * @param {String | undefined} args.localizedToolTip A localized text to 
   * display as a tool tip. 
   * 
   * @param {Any | undefined} args.value The current value. 
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
   */
  constructor(args = {}) {
    super(args);

    this._value = args.value;
    this.onChange = args.onChange ?? (() => {});
    this.onInput = args.onInput ?? (() => {});
    this.onFocus = args.onFocus ?? (() => {});
    this.onFocusLost = args.onFocusLost ?? (() => {});
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);

    $(this.inputElement).change(this._onChange.bind(this));
    $(this.inputElement).on("input", this._onInput.bind(this));
    $(this.inputElement).on("focus", this._onFocus.bind(this));
    $(this.inputElement).on("focusout", this._onFocusLost.bind(this));
  }
  
  /**
   * Internal callback for the value change. 
   * 
   * @param {Event} event 
   * 
   * @protected
   */
  _onChange(event) {
    if (this._suppressEvent) return;
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

  /**
   * Internal callback for onFocus. 
   * 
   * @param {Event} event 
   * 
   * @protected
   */
  _onFocus(event) {
    this.onFocus(event, this);
  }

  /**
   * Internal callback for onFocusLost. 
   * 
   * @param {Event} event 
   * 
   * @protected
   */
  _onFocusLost(event) {
    this.onFocusLost(event, this);
  }
}
