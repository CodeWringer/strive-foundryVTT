import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";
import InputViewModel from "../../view-model/input-view-model.mjs";

/**
 * Represents a radio-button-group. The user can select one of a defined list of options. 
 * 
 * @extends InputViewModel
 * 
 * @property {String} localizedValue Gets the localized version of the value. 
 * @property {ChoiceOption} selected Gets the currently selected option. 
 * @property {Array<ChoiceOption>} options Gets the options available to the radio button group. 
 */
export default class InputRadioButtonGroupViewModel extends InputViewModel {
  /** @override */
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
   * @param {Object} args
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
   * 
   * @throws {Error} NullPointerException Thrown if the radio button container could not be found. 
   */
  async activateListeners(html, isOwner, isEditable) {
    await super.activateListeners(html, isOwner, isEditable);

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
