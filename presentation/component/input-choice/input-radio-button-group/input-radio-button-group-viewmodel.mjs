import { ValidationUtil } from "../../../../business/util/validation-utility.mjs";
import ButtonViewModel from "../../button/button-viewmodel.mjs";
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
   * @param {StatefulChoiceOption | undefined} args.value The current value. 
   * @param {Function | undefined} args.onChange Callback that is invoked 
   * when the value changes. Receives two arguments: 
   * * `oldValue: {StatefulChoiceOption}`
   * * `newValue: {StatefulChoiceOption}`
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["options"]);

    // Ensure the active option has its isActive flag set accordingly. 
    this.value.isActive = true;

    this._mappedOptions = args.options.map(choice => {
      return {
        ...choice,
        vm: new ButtonViewModel({
          id: choice.value,
          parent: this,
          localizedToolTip: choice.tooltip,
          onClick: () => {
            this.value = choice;
          },
        }),
      }
    });
  }

  /** @override */
  _onChange(event) {
    // Overridden to prevent the onChange callback to be invoked (again by the inherited type). 
  }
}
