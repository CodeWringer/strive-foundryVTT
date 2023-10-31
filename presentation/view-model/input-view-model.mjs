import { setNestedPropertyValue, getNestedPropertyValue } from "../../business/util/property-utility.mjs";
import { validateOrThrow } from "../../business/util/validation-utility.mjs";
import { getElementValue } from "../sheet/sheet-utility.mjs";
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
 * @property {String | undefined} localizedToolTip A localized text to 
 * display as a tool tip. 
 * @property {String | undefined} iconHtml Raw HTML to render as 
 * an associated icon. E. g. `'<i class="fas fa-scroll"></i>'`
 * @property {Any | undefined} value The current value. 
 * * Upon change, invokes the `onChange` callback. 
 * @property {String} localizedValue The current value, localized. 
 * * Read-only
 * @property {JQuery | HTMLElement} element The DOM element that is 
 * associated with this view model. 
 * * Read-only
 * 
 * @method onChange Callback that is invoked when the value changes. 
 * Receives the following arguments: 
 * * `oldValue: {Any}`
 * * `newValue: {Any}`
 */
export default class InputViewModel extends ViewModel {

  get value() { return this._value; }
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
   * @type {JQuery | HTMLElement}
   * @private
   */
  _element = undefined;
  /**
   * @type {JQuery | HTMLElement}
   * @readonly
   */
  get element() { return this._element; }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * @param {Boolean | undefined} args.isEditable If `true`, input(s) will 
   * be in edit mode. If `false`, will be in read-only mode.
   * * default `false`. 
   * 
   * @param {String | undefined} args.localizedToolTip A localized text to 
   * display as a tool tip. 
   * @param {String | undefined} args.iconHtml Raw HTML to render as 
   * an associated icon. E. g. `'<i class="fas fa-scroll"></i>'`
   * @param {Function | undefined} args.onChange Callback that is invoked when the value changes. 
   * * Receives two arguments: 
   * * * `oldValue: {Any}`
   * * * `newValue: {Any}`
   * @param {Any | undefined} args.value The current value. 
   */
  constructor(args = {}) {
    super(args);

    this.localizedToolTip = args.localizedToolTip;
    this.iconHtml = args.iconHtml;
    this._value = args.value;
    this.onChange = args.onChange ?? (() => {});
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);

    this._element = this._detectElement(html);

    if (this.isEditable !== true) return;

    this.element.change(this._onChange.bind(this));
  }

  /**
   * Finds and returns the associated DOM element, if possible. 
   * 
   * @param {Any} html 
   * 
   * @returns {JQuery | undefined} The element. 
   * 
   * @protected
   */
  _detectElement(html) {
    let element = html.find(`.${SELECTOR_EDIT}#${this.id}`);
    
    if (element === undefined || element === null || element.length === 0) {
      element = html.find(`.${SELECTOR_READ}#${this.id}`);
    }
    
    if (element === undefined || element === null || element.length === 0) {
      throw new Error(`NullPointerException: Failed to get input element with id '${this.id}'`);
    }

    return element;
  }

  /**
   * Internal callback for the value change. 
   * 
   * @param {Event} event 
   * 
   * @private
   */
  _onChange(event) {
    const newValue = getElementValue(event.currentTarget);
    this.value = newValue;
  }
}
