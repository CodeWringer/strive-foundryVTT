import { validateOrThrow } from "../../../../business/util/validation-utility.mjs";
import { TEMPLATES } from "../../../templatePreloader.mjs";
import InputChoiceViewModel from "../input-choice-viewmodel.mjs";
import StatefulChoiceOption from "../stateful-choice-option.mjs";

/**
 * Represents a radio-button-group. The user can select one of a defined list of options. 
 * 
 * @extends InputChoiceViewModel
 * 
 * @property {StatefulChoiceOption} value The current value. 
 * @property {Array<StatefulChoiceOption>} options Gets the options available to the radio button group. 
 * 
 * @method onChange Callback that is invoked when the value changes. 
 * Receives the following arguments: 
 * * `oldValue: {StatefulChoiceOption}`
 * * `newValue: {StatefulChoiceOption}`
 */
export default class InputRadioButtonGroupViewModel extends InputChoiceViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.COMPONENT_INPUT_RADIO_BUTTON_GROUP; }

  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
   */
  static registerHandlebarsPartial() {
    Handlebars.registerPartial('inputRadioButtonGroup', `{{> "${InputRadioButtonGroupViewModel.TEMPLATE}"}}`);
  }

  /**
   * @param {Object} args
   * @param {Array<StatefulChoiceOption>} args.options The options available to the radio button group. 
   * @param {String | undefined} args.value The current value. Must correspond 
   * to a `ChoiceOption.value` from the `options`. 
   * @param {Function | undefined} args.onChange Callback that is invoked 
   * when the value changes. Receives two arguments: 
   * * `oldValue: {StatefulChoiceOption}`
   * * `newValue: {StatefulChoiceOption}`
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["options"]);

    this.options = args.options;
    this._value = args.value ?? (args.options.length > 0 ? args.options[0].value : "");
  }

  /**
   * @override
   * 
   * @throws {Error} NullPointerException Thrown if the radio button container could not be found. 
   */
  async activateListeners(html) {
    await super.activateListeners(html);

    if (this.isEditable !== true) return;

    const radioButtonContainer = this.element.find(".radio-button-container");

    if (radioButtonContainer === undefined || radioButtonContainer === null || radioButtonContainer.length === 0) {
      throw new Error("NullPointerException: Failed to find radio button container");
    }

    const radioButtons = radioButtonContainer.find('.radio-button');
    for (const radioButton of radioButtons) {
      // Hook up events on radio button options. 
      radioButton.onchange = (event) => {
        const option = this.options.find(it => it.value === event.currentTarget.value);
        this.value = option;
      }
    }
  }

  /**
   * Returns true, if the given `StatefulChoiceOption` represents the 
   * current selection of the given `InputRadioButtonGroupViewModel`. 
   * 
   * @param {InputRadioButtonGroupViewModel} viewModel 
   * @param {StatefulChoiceOption} option The option to check. 
   * 
   * @returns {Boolean}
   * 
   * @protected Only for use in the template. 
   */
  _isSelectedOption(viewModel, option) {
    if (viewModel.value === option.value) {
      return true;
    } else {
      return false;
    }
  }
}
