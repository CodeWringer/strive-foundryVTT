import { getElementValue } from "../../../sheet/sheet-utility.mjs";
import InputChoiceViewModel from "../input-choice-viewmodel.mjs";

/**
 * Represents a drop-down input. The user can select one of a defined list of options. 
 * 
 * @extends InputChoiceViewModel
 * 
 * @property {ChoiceOption} value The currently selected option. 
 * @property {Array<ChoiceOption>} options Gets the options available to the drop-down. 
 * 
 * @method onChange Callback that is invoked when the value changes. 
 * Receives the following arguments: 
 * * `oldValue: {ChoiceOption}`
 * * `newValue: {ChoiceOption}`
 */
export default class InputDropDownViewModel extends InputChoiceViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.COMPONENT_INPUT_DROPDOWN; }

  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
   */
  static registerHandlebarsPartial() {
    Handlebars.registerPartial('inputDropDown', `{{> "${InputDropDownViewModel.TEMPLATE}"}}`);
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
        const value = optionElements[i].value;
        if (value === this.value.value) {
          this.element[0].selectedIndex = i;
          break;
        }
      }
    } catch (error) {
      throw new Error("UnknownException: Failed to set the current drop-down option", { cause: error });
    }
  }

  /** @override */
  _onChange(event) {
    const newValue = getElementValue(event.currentTarget);
    this.value = this.options.find(it => it.value === newValue);
  }
}
