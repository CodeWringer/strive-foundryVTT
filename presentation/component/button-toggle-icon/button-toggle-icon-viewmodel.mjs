import { getNestedPropertyValue,setNestedPropertyValue } from "../../../business/util/property-utility.mjs";
import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";
import ButtonViewModel from "../button/button-viewmodel.mjs";

/**
 * A button that allows toggling a specific boolean value. 
 * 
 * Toggles between two given 
 * 
 * @extends ButtonViewModel
 * 
 * @property {Object} target An object on which to look for a property 
 * identified by the given `propertyPath`. 
 * @property {String} propertyPath The path identifying the boolean value. 
 * @property {Boolean} value The value of the boolean property. 
 */
export default class ButtonToggleIconViewModel extends ButtonViewModel {
  static get TEMPLATE() { return TEMPLATES.COMPONENT_BUTTON_TOGGLE_ICON; }
  
  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
  */
 static registerHandlebarsPartial() {
    Handlebars.registerPartial('buttonToggleIcon', `{{> "${ButtonToggleIconViewModel.TEMPLATE}"}}`);
  }

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
   * @param {Object} args
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * @param {Function | String | undefined} args.callback Defines an asynchronous callback that is invoked upon completion of the button's own callback. 
   * @param {Boolean | undefined} args.isEditable If true, will be interactible. 
   * @param {String | undefined} args.localizedTooltip Localized tooltip. 
   * 
   * @param {Object} args.target The target document to affect.  
   * @param {String} args.propertyPath The path used to look up the value. 
   * @param {String} args.iconActive An HTML-String of the "active" icon. 
   * * E. g. `"<i class="fas fa-eye"></i>"`
   * @param {String} args.iconInactive An HTML-String of the "inactive" icon. 
   * * E. g. `"<i class="fas fa-eye-slash"></i>"`
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["propertyPath", "target", "iconActive", "iconInactive"]);

    this.propertyPath = args.propertyPath;
    this.iconActive = args.iconActive;
    this.iconInactive = args.iconInactive;
  }

  /** @override */
  async onClick(html, isOwner, isEditable) {
    if (isEditable !== true) return;
    
    this.value = !this.value;
  }
}
