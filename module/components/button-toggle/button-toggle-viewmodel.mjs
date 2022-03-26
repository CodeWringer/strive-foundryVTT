import { TEMPLATES } from "../../templatePreloader.mjs";
import { getNestedPropertyValue, setNestedPropertyValue } from "../../utils/property-utility.mjs";
import { validateOrThrow } from "../../utils/validation-utility.mjs";
import ButtonViewModel from "../button/button-viewmodel.mjs";

export default class ButtonToggleViewModel extends ButtonViewModel {
  static get TEMPLATE() { return TEMPLATES.COMPONENT_BUTTON_TOGGLE; }

  /**
   * @type {String}
   */
  propertyPath = undefined;

  /**
   * @type {Any}
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
   * @param {Any} newValue
   */
  set value(newValue) {
    try {
      if (this.target.updateProperty !== undefined) {
        this.target.updateProperty(this.propertyPath, newValue);
      } else {
        setNestedPropertyValue(this.target, this.propertyPath, newValue);
      }
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
   * @param {Object} args.target Optional. The target object to affect.  
   * @param {Function | String | undefined} args.callback Optional. Defines an asynchronous callback that is invoked upon completion of the button's own callback. 
   * @param {Any | undefined} args.callbackData Optional. Defines any data to pass to the completion callback. 
   * @param {Boolean | undefined} args.isEditable Optional. If true, will be interactible. 
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
    this.value = !this.value;
  }
}

Handlebars.registerPartial('buttonToggle', `{{> "${ButtonToggleViewModel.TEMPLATE}"}}`);
