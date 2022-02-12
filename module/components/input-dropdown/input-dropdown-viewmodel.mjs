import { TEMPLATES } from "../../templatePreloader.mjs";
import InputViewModel from "../input-viewmodel.mjs";
import { selectItemByValue } from "../../utils/sheet-utility.mjs";

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
 * @property {String} localizedValue Gets the localized version of the value. 
 * @property {ChoiceOption} selected Gets the currently selected option. 
 * @property {Array<ChoiceOption>} options Gets the options available to the drop-down. 
 * 
 */
export default class InputDropDownViewModel extends InputViewModel {
  static get template() { return TEMPLATES.COMPONENT_INPUT_DROPDOWN; }

  get selected() {
    return this.options.find(option => option.value === this.value);
  }

  get localizedValue() {
    return this.selected.localizedValue;
  }

  /**
   * @param {Boolean | undefined} args.isEditable 
   * @param {Boolean | undefined} args.isSendable 
   * @param {String | undefined} args.id
   * @param {String} args.propertyPath
   * @param {Object} args.propertyOwner
   * @param {Array<ChoiceOption>} args.options
   */
  constructor(args = {}) {
    super(args);
    args = {
      options: [],
      ...args,
    }
    this.options = args.options;
  }

  /**
   * @override
   * @see "module\components\input-viewmodel.mjs"
   * @throws {Error} UnknownException Thrown if the current option could not be set correctly. 
   */
  activateListeners(html, isOwner, isEditable, isSendable) {
    super.activateListeners(html, isOwner, isEditable, isSendable);

    if (isEditable !== true) return;

    // Ensure correct option of drop-down is set. 
    try {
      selectItemByValue(this.element, this.value);
    } catch (error) {
      throw new Error("UnknownException: Failed to set the current drop-down option", { cause: error });
    }
  }
}