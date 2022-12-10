import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import { TEMPLATES } from "../../template/templatePreloader.mjs";
import InputViewModel from "../../view-model/input-view-model.mjs";

/**
 * --- Inherited from ViewModel
 * 
 * @property {Boolean} isEditable If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
 * @property {String} id Optional. Id used for the HTML element's id and name attributes. 
 * @property {String} TEMPLATE Static. Returns the template this ViewModel is intended for. 
 * 
 * --- Inherited from InputViewModel
 * 
 * @property {JQuery | HTMLElement} element The button element on the DOM. 
 * @property {String} propertyPath The path used to look up the value. 
 * @property {Object} propertyOwner An object on which to to look up the value. 
 * @property {Any} value Gets or sets the looked up value. 
 * 
 * --- Own properties
 * 
 * @property {String} localizedValue Gets the localized version of the value. 
 * @property {ChoiceOption} selected Gets the currently selected option. 
 * @property {Array<ChoiceOption>} options Gets the options available to the radio button group. 
 * 
 */
export default class InputRadioButtonGroupViewModel extends InputViewModel {
  static get TEMPLATE() { return TEMPLATES.COMPONENT_INPUT_RADIO_BUTTON_GROUP; }
  
  /**
   * Returns the currently selected option. 
   * @type {ChoiceOption}
   * @readonly
   */
  get selected() {
    return this.options.find(option => option.value === this.value);
  }

  /**
   * Returns the localized value. 
   * @type {String}
   * @readonly
   * @override
   */
  get localizedValue() {
    const selected = this.selected;
    return selected !== undefined ? selected.localizedValue : "";
  }

  /**
   * @type {HTMLElement}
   * @private
   */
  _lastChecked = undefined;
  /**
   * @type {HTMLElement}
   * @readonly
   */
  get lastChecked() { return this._lastChecked; }

  /**
   * @param {String | undefined} args.id Optional. Unique ID of this view model instance. 
   * 
   * @param {String} args.propertyPath The path used to look up the value. 
   * @param {Object} args.propertyOwner An object on which to to look up the value. 
   * @param {Boolean | undefined} args.isEditable Optional. If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
   * @param {String | undefined} args.contextTemplate Optional. Name or path of a template that embeds this input component. 
   * @param {String | undefined} args.localizableTitle Optional. The localizable title (tooltip). 
   * 
   * @param {Array<ChoiceOption>} args.options The options available to the radio button group. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["propertyPath", "propertyOwner", "options"]);

    this.options = args.options ?? [];
  }

  /**
   * @override
   * @see "module\components\input-viewmodel.mjs"
   * @throws {Error} NullPointerException Thrown if the radio button container could not be found. 
   */
  activateListeners(html, isOwner, isEditable) {
    super.activateListeners(html, isOwner, isEditable);

    if (isEditable !== true) return;

    const radioButtonContainer = this.element.find(".radio-button-container");

    if (radioButtonContainer === undefined || radioButtonContainer === null || radioButtonContainer.length === 0) {
      throw new Error("NullPointerException: Failed to find radio button container");
    }

    const radioButtons = radioButtonContainer.find('.radio-button');
    for (const radioButton of radioButtons) {
      // Hook up events on radio button options. 
      radioButton.onchange = (event) => {
        this.value = event.currentTarget.value;
      }
    }
  }

  /**
   * Returns true, if the given {ChoiceOption} represents the 
   * current selection of the given {InputRadioButtonGroupViewModel}. 
   * @param {InputRadioButtonGroupViewModel} viewModel 
   * @param {ChoiceOption} option The option to check. 
   * @returns {Boolean}
   */
  isSelectedOption(viewModel, option) {
    if (viewModel.value === option.value) {
      return true;
    } else {
      return false;
    }
  }
}

Handlebars.registerPartial('inputRadioButtonGroup', `{{> "${InputRadioButtonGroupViewModel.TEMPLATE}"}}`);
