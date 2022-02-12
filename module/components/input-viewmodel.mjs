import ViewModel from "./viewmodel.mjs";
import { setNestedPropertyValue, getNestedPropertyValue } from "../utils/property-utility.mjs";
import { getElementValue } from "../utils/sheet-utility.mjs";

/**
 * --- Inherited from ViewModel
 * 
 * @property {Boolean} isEditable If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
 * @property {Boolean} isSendable If true, the object can be sent to chat. 
 * @property {String} id Optional. Id used for the HTML element's id and name attributes. 
 * @property {String} template Static. Returns the template this ViewModel is intended for. 
 * 
 * --- Own properties
 * 
 * @property {String} propertyPath The path used to look up the value. 
 * @property {Object} propertyOwner An object on which to to look up the value. 
 * @property {Any} value Gets or sets the looked up value. 
 * @property {DocumentSheet | undefined} owningSheet Gets the owning {DocumentSheet} instance. 
 * For example, could be an instance of {ActorSheet} or {ItemSheet}. 
 */
export default class InputViewModel extends ViewModel {
  /**
   * Constant that defines the css class to look for when identifying edit input elements. 
   * @static
   * @readonly
   */
  static SELECTOR_EDIT = "custom-system-edit";
  /**
   * Constant that defines the css class to look for when identifying read-only input elements. 
   * @static
   * @readonly
   */
  static SELECTOR_READ = "custom-system-read-only";

  /**
   * @type {Any}
   */
  get value() { return getNestedPropertyValue(this.propertyOwner, this.propertyPath); }
  /**
   * @param {Any} newValue
   */
  set value(newValue) {
    return new Promise((resolve, reject) => {
      try {
        if (this.propertyOwner.updateProperty !== undefined) {
          this.propertyOwner.updateProperty(this.propertyPath, newValue)
            .then(resolve());
        } else {
          setNestedPropertyValue(this.propertyOwner, this.propertyPath, newValue);
          resolve();
        }
      } catch (error) {
        reject(error);
      }
    });
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
   * @type {DocumentSheet | undefined}
   * @private
   */
  _owningSheet = undefined;
  /**
   * @type {DocumentSheet | undefined}
   * @readonly
   */
  get owningSheet() { return this._owningSheet; }

  /**
   * @param {Boolean | undefined} args.isEditable 
   * @param {Boolean | undefined} args.isSendable 
   * @param {String | undefined} args.id
   * @param {String} args.propertyPath
   * @param {Object} args.propertyOwner
   */
  constructor(args = {}) {
    super(args);
    args = {
      propertyPath: undefined,
      propertyOwner: undefined,
      ...args,
    }
    this.propertyPath = args.propertyPath;
    this.propertyOwner = args.propertyOwner;
  }

  /**
   * Registers events on elements of the given DOM. 
   * @param {Object} html DOM of the sheet for which to register listeners. 
   * @param {Boolean} isOwner If true, registers events that require owner permission. 
   * @param {Boolean} isEditable If true, registers events that require editing permission. 
   * @param {Boolean} isSendable If true, registers events that require sendToChat permission. 
   * @throws {Error} NullPointerException Thrown if the input element could not be found. 
   */
  activateListeners(html, isOwner, isEditable, isSendable) {
    this._element = html.find(`.${InputViewModel.SELECTOR_EDIT}#${this.id}`);
    
    if (this._element === undefined || this._element === null) {
      this._element = html.find(`.${InputViewModel.SELECTOR_READ}#${this.id}`);
    }
    
    if (this._element === undefined || this._element === null) {
      throw new Error(`NullPointerException: Failed to get input element with id '${this.id}'`);
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
