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
export default class InputRadioButtonGroupViewModel extends InputViewModel {
  static get template() { return TEMPLATES.COMPONENT_INPUT_RADIO_BUTTON_GROUP; }

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
   * @throws {Error} NullPointerException Thrown if the radio button container could not be found. 
   */
  activateListeners(html, isOwner, isEditable, isSendable) {
    super.activateListeners(html, isOwner, isEditable, isSendable);

    if (isEditable !== true) return;

    const radioButtonContainer = this.element.find(".radio-button-container");

    if (radioButtonContainer === undefined) {
      throw new Error("NullPointerException: Failed to find radio button container");
    }

    const radioButtons = radioButtonContainer.find('.radio-button');
    for (const radioButton of radioButtons) {
      // Hook up events on radio button options. 
      radioButton.onchange = (event) => {
        this.value = event.currentTarget.value;
      };
      
      // Ensure correct option of radio-buttons is set.
      if (this.value == radioButton.value) {
        radioButton.checked = true;
        radioButtonContainer.className = radioButtonContainer.className + " active";
      }
    }
  }
}
