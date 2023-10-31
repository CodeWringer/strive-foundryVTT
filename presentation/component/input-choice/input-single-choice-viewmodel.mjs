import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import InputChoiceViewModel from "./input-choice-viewmodel.mjs";

/**
 * Represents a choice input. The user can select one of a defined list of options. 
 * 
 * @extends InputChoiceViewModel
 * 
 * @property {ChoiceOption} value The current value. 
 * @property {Array<ChoiceOption>} options Gets the options available. 
 * * Read-only. 
 * 
 * @abstract
 */
export default class InputSingleChoiceViewModel extends InputChoiceViewModel {
  /**
   * @param {Object} args
   * @param {ChoiceOption} args.value The current value. 
   * @param {Array<ChoiceOption>} args.options The options available to the drop-down. 
   * @param {ChoiceAdapter} args.adapter A `ChoiceOption` adapter. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["value", "options", "adapter"]);
  }
  
  /**
   * @override
   * 
   * @throws {Error} UnknownException Thrown if the current option could not be set correctly. 
   */
  async activateListeners(html) {
    await super.activateListeners(html);

    if (this.isEditable !== true) return;
    
    // Ensure correct option of drop-down is set. 
    try {
      const optionElements = this.element.find('option');
      for(let i = 0; i < optionElements.length; i++) {
        const optionElement = optionElements[i];
        if (optionElement.value === this.value.value) {
          this.element[0].selectedIndex = i;
          break;
        }
      }
    } catch (error) {
      throw new Error("UnknownException: Failed to set the current drop-down option", { cause: error });
    }
  }
}
