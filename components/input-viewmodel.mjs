import ViewModel from "./viewmodel.mjs";
import { setNestedPropertyValue, getNestedPropertyValue } from "../module/utils/property-utility.mjs";

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
 */
export default class InputViewModel extends ViewModel {
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

  get value() { return getNestedPropertyValue(this.propertyOwner, this.propertyPath); }
  set value(newValue) {
    return new Promise((resolve, reject) => {
      try {
        if (this.propertyOwner.updateProperty !== undefined) {
          this.propertyOwner.updateProperty(this.propertyPath, newValue).then(resolve());
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
   * Registers events on elements of the given DOM. 
   * @param html {Object} DOM of the sheet for which to register listeners. 
   * @param isOwner {Boolean} If true, registers events that require owner permission. 
   * @param isEditable {Boolean} If true, registers events that require editing permission. 
   */
  activateListeners(html, isOwner, isEditable) {
    // -------------------------------------------------------------
    if (!isOwner) return;
    // -------------------------------------------------------------
    if (!isEditable) return;

    // html.getElementById(this.id).change(this._onEdit.bind(this));
    // html.find(".ambersteel-edit").change(this._onEdit.bind(this));
    html.find(`#${this.id}`).change(this._onEdit.bind(this));
  }
  
  /**
   * @param event 
   * @private
   */
  async _onEdit(event) {
    const newValue = getElementValue(event.currentTarget);
    this.value = newValue;
  }
}