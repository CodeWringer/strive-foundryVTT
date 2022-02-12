import { TEMPLATES } from "../../templatePreloader.mjs";
import InputViewModel from "../input-viewmodel.mjs";

/**
 * --- Inherited from ViewModel
 * 
 * @property {Boolean} isEditable If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
 * @property {Boolean} isSendable If true, the object can be sent to chat. 
 * @property {String} id Optional. Id used for the HTML element's id and name attributes. 
 * @property {String} template Static. Returns the template this ViewModel is intended for. 
 * 
 * --- Inherited from InputViewModel
 * 
 * @property {String} propertyPath The path used to look up the value. 
 * @property {Object} propertyOwner An object on which to to look up the value. 
 * @property {Any} value Gets or sets the looked up value. 
 * 
 * --- Own properties
 * 
 * @property {String} placeholder Gets a placeholder text to display while the textfield is empty. 
 */
export default class InputTextFieldViewModel extends InputViewModel {
  static get template() { return TEMPLATES.COMPONENT_INPUT_TEXTFIELD; }

  /**
   * @type {String}
   * @private
   */
  _placeholder = "";
  /**
   * @type {String}
   * @readonly
   */
  get placeholder() { return this._placeholder; }

  /**
   * @param {Boolean | undefined} args.isEditable 
   * @param {Boolean | undefined} args.isSendable 
   * @param {String | undefined} args.id
   * @param {String} args.propertyPath
   * @param {Object} args.propertyOwner
   * @param {String} args.placeholder
   */
  constructor(args = {}) {
    super(args);
    args = {
      placeholder: "",
      ...args,
    }
    this._placeholder = args.placeholder;
  }
}