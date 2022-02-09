import { TEMPLATES } from "../../module/templatePreloader.mjs";
import { getNestedPropertyValue } from "../../module/utils/property-utility.mjs";
import ViewModel from "../viewmodel.mjs";

/**
 * @property {Boolean} isEditable If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
 * @property {Boolean} isSendable If true, the object can be sent to chat. 
 * @property {String} id Optional. Id used for the HTML element's id and name attributes. 
 * @property {String} template Static. Returns the template this ViewModel is intended for. 
 * @property {String} propertyPath The path used to look up the value. 
 * @property {Object} propertyOwner An object on which to to look up the value. 
 * @property {String} placeholder Optional. A placeholder text to display while the textfield is empty. 
 */
export default class InputTextFieldViewModel extends ViewModel {
  static get template() { return TEMPLATES.COMPONENT_INPUT_TEXTFIELD; }

  constructor(args = {
    propertyPath: undefined,
    propertyOwner: undefined,
    placeholder: "",
  }) {
    super(args);
    this.propertyPath = args.propertyPath;
    this.propertyOwner = args.propertyOwner;
    this.placeholder = this.placeholder;
  }

  get value() { return getNestedPropertyValue(this.propertyOwner, this.propertyPath); }
  async set value(newValue) {
    if (this.propertyOwner.updateProperty !== undefined) {
      await this.propertyOwner.updateProperty(this.propertyPath, newValue);
    } else {
      
    }
  }
}