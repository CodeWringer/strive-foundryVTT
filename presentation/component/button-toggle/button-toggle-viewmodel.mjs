import { getNestedPropertyValue,setNestedPropertyValue } from "../../../business/util/property-utility.mjs";
import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import { TEMPLATES } from "../../template/templatePreloader.mjs";
import ButtonViewModel from "../button/button-viewmodel.mjs";

/**
 * A button that allows changing a specific boolean value on a `TransientDocument` 
 * instance, identified by the `propertyPath`. 
 * 
 * @extends ButtonViewModel
 * 
 * @property {TransientDocument} target A document instance. 
 * @property {String} propertyPath The path identifying the boolean value. 
 * @property {Boolean} value The value of the boolean property. 
 */
export default class ButtonToggleViewModel extends ButtonViewModel {
  static get TEMPLATE() { return TEMPLATES.COMPONENT_BUTTON_TOGGLE; }

  /**
   * Returns the current value of the property. 
   * 
   * @type {Boolean}
   */
  get value() {
    try {
      return getNestedPropertyValue(this.target, this.propertyPath);
    } catch (error) {
      if (this._contextTemplate !== undefined) {
        throw new Error(`[${this._contextTemplate}] IllegalStateException: ${error.message}`);
      } else {
        throw error;
      }
    }
  }
  /**
   * Sets the value of the property. 
   * 
   * @param {Boolean} newValue
   */
  set value(newValue) {
    try {
      setNestedPropertyValue(this.target, this.propertyPath, newValue);
    } catch (error) {
      if (this._contextTemplate !== undefined) {
        throw new Error(`[${this._contextTemplate}] IllegalStateException: ${error.message}`);
      } else {
        throw error;
      }
    }
  }

  /**
   * @param {String | undefined} args.id Optional. Unique ID of this view model instance. 
   * 
   * @param {TransientDocument} args.target Optional. The target document to affect.  
   * @param {Function | String | undefined} args.callback Optional. Defines an asynchronous callback that is invoked upon completion of the button's own callback. 
   * @param {Any | undefined} args.callbackData Optional. Defines any data to pass to the completion callback. 
   * @param {Boolean | undefined} args.isEditable Optional. If true, will be interactible. 
   * @param {String | undefined} args.localizableTitle Optional. The localizable title (tooltip). 
   * 
   * @param {String} args.propertyPath The path used to look up the value. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["propertyPath", "target"]);

    this.propertyPath = args.propertyPath;
  }

  /** @override */
  async onClick(html, isOwner, isEditable) {
    if (isEditable !== true) return;
    
    this.value = !this.value;
  }
}

Handlebars.registerPartial('buttonToggle', `{{> "${ButtonToggleViewModel.TEMPLATE}"}}`);
