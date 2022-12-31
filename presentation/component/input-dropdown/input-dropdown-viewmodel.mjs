import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import { TEMPLATES } from "../../template/templatePreloader.mjs";
import InputSingleChoiceViewModel from "../input-choice/input-single-choice-viewmodel.mjs";

/**
 * Represents a drop-down input. The user can select one of a defined list of options. 
 * 
 * @extends InputSingleChoiceViewModel
 * 
 * @property {String} localizedValue Gets the localized version of the value. 
 * @property {ChoiceOption} selected Gets the currently selected option. 
 * @property {Array<ChoiceOption>} options Gets the options available to the drop-down. 
 */
export default class InputDropDownViewModel extends InputSingleChoiceViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.COMPONENT_INPUT_DROPDOWN; }
}

Handlebars.registerPartial('inputDropDown', `{{> "${InputDropDownViewModel.TEMPLATE}"}}`);
