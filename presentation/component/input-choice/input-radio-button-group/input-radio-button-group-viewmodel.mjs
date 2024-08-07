import { isDefined, validateOrThrow } from "../../../../business/util/validation-utility.mjs";
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
  static get TEMPLATE() { return game.strive.const.TEMPLATES.COMPONENT_INPUT_RADIO_BUTTON_GROUP; }

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

    // Ensure the active option has its isActive flag set accordingly. 
    this.value.isActive = true;
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
        if (isDefined(option)) {
          this.value = option;
        } else {
          game.strive.logger.logWarn("Failed to get selected radio button option");
        }
      }
    }
  }

  /** @override */
  _onChange(event) {
    // Overridden to prevent the onChange callback to be invoked (again by the inherited type). 
  }
}
