import { TEMPLATES } from "../../templatePreloader.mjs";
import InputSingleChoiceViewModel from "../input-choice/input-single-choice-viewmodel.mjs";

/**
 * Represents a drop-down input. The user can select one of a defined list of options. 
 * 
 * @extends InputSingleChoiceViewModel
 * 
 * @property {ChoiceOption} value The currently selected option. 
 * @property {Array<ChoiceOption>} options Gets the options available to the drop-down. 
 * @method onChange Callback that is invoked when the value changes. 
 * Receives the following arguments: 
 * * `oldValue: {ChoiceOption}`
 * * `newValue: {ChoiceOption}`
 */
export default class InputDropDownViewModel extends InputSingleChoiceViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.COMPONENT_INPUT_DROPDOWN; }

  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
   */
  static registerHandlebarsPartial() {
    Handlebars.registerPartial('inputDropDown', `{{> "${InputDropDownViewModel.TEMPLATE}"}}`);
  }
}
