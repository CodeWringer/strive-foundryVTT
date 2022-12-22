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
 * @property {Boolean} isEditable If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
 * @property {JQuery | HTMLElement} element The button element on the DOM. 
 * @property {String} propertyPath The path used to look up the value. 
 * @property {Object} propertyOwner An object on which to to look up the value. 
 * @property {Any} value Gets or sets the looked up value. 
 * @property {String | undefined} localizableTitle The localizable title (tooltip). 
 * @property {String} localizedTitle The localized title (tooltip). 
 */
export default class InputViewModel extends ViewModel {
  /**
   * @type {Boolean}
   * @private
   */
  _isEditable = false;
  /**
   * @type {Boolean}
   * @readonly
   * @throws {Error} DisposedAccessViolation Thrown if the object has been disposed. 
   */
  get isEditable() { return this._isEditable; }

  /**
   * Name or path of a template that embeds this input component. 
   * @type {String | undefined}
   * @private
   */
  _contextTemplate = undefined;

  /**
   * The localizable title (tooltip). 
   * @type {String | undefined}
   */
  localizableTitle = undefined;

  /**
   * The localized title (tooltip). 
   * @type {String}
   * @readonly
   */
  get localizedTitle() { return this.localizableTitle !== undefined ? game.i18n.localize(this.localizableTitle) : ""; }

  /**
   * @type {Any}
   */
  get value() {
    try {
      return getNestedPropertyValue(this.propertyOwner, this.propertyPath);
    } catch (error) {
      if (this._contextTemplate !== undefined) {
        throw new Error(`[${this._contextTemplate}] IllegalStateException: ${error.message}`);
      } else {
        throw error;
      }
    }
  }
  /**
   * @param {Any} newValue
   */
  set value(newValue) {
    try {
      setNestedPropertyValue(this.propertyOwner, this.propertyPath, newValue);
    } catch (error) {
      if (this._contextTemplate !== undefined) {
        throw new Error(`[${this._contextTemplate}] IllegalStateException: ${error.message}`);
      } else {
        throw error;
      }
    }
  }

  /**
   * Returns the localized value. 
   * @type {String}
   * @readonly
   */
  get localizedValue() {
    const value = this.value;
    return (value !== undefined && value !== null) ? game.i18n.localize(value) : value;
  }

  /**
   * @type {JQuery | HTMLElement}
   * @private
   */
  _element = undefined;
  /**
   * Returns the HTMLElement that is associated with this view model. 
   * @type {JQuery | HTMLElement}
   * @readonly
   */
  get element() { return this._element; }

  /**
   * @param {String | undefined} args.id Optional. Unique ID of this view model instance. 
   * 
   * @param {String} args.propertyPath The path used to look up the value. 
   * @param {Object} args.propertyOwner An object on which to to look up the value. 
   * @param {Boolean | undefined} args.isEditable Optional. If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
   * @param {String | undefined} args.contextTemplate Optional. Name or path of a template that embeds this input component. 
   * @param {String | undefined} args.localizableTitle Optional. The localizable title (tooltip). 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["propertyPath", "propertyOwner"]);

    this._isEditable = args.isEditable ?? false;
    this.propertyPath = args.propertyPath;
    this.propertyOwner = args.propertyOwner;
    this._contextTemplate = args.contextTemplate;
    this.localizableTitle = args.localizableTitle;
  }

  /** @override */
  activateListeners(html, isOwner, isEditable) {
    super.activateListeners(html, isOwner, isEditable);

    this._element = html.find(`.${SELECTOR_EDIT}#${this.id}`);
    
    if (this._element === undefined || this._element === null || this._element.length === 0) {
      this._element = html.find(`.${SELECTOR_READ}#${this.id}`);
    }
    
    if (this._element === undefined || this._element === null || this._element.length === 0) {
      const errorMessage = `NullPointerException: Failed to get input element with id '${this.id}'`;
      if (this._contextTemplate !== undefined) {
        throw new Error(`[${this._contextTemplate}] ${errorMessage}`);
      } else {
        throw new Error(errorMessage);
      }
    }

    // -------------------------------------------------------------
    if (!isOwner) return;
    // -------------------------------------------------------------
    if (!isEditable) return;

    this.element.change(this._onEdit.bind(this));
  }

  /**
   * @param event 
   * @private
   * @async
   */
  async _onEdit(event) {
    const newValue = getElementValue(event.currentTarget);
    this.value = newValue;
  }
}
