import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import InputChoiceViewModel from "./input-choice-viewmodel.mjs";

/**
 * Represents a choice input. The user can select one of a defined list of options. 
 * 
 * @extends InputChoiceViewModel
 * 
 * @property {String} localizedValue Gets the localized version of the value. 
 * * Read-only. 
 * @property {ChoiceOption} selected Gets or sets the currently 
 * selected options. 
 * @property {Array<ChoiceOption>} options Gets the options available. 
 * * Read-only. 
 * @property {ChoiceAdapter} adapter A `ChoiceOption` adapter. 
 * * Often times, the actual value of a field on a document is not of type `ChoiceOption`, 
 * but rather some other business type. This adapter allows mapping to and from `ChoiceOption`s,
 * based on those actual values.
 * 
 * @abstract
 */
export default class InputSingleChoiceViewModel extends InputChoiceViewModel {
  /**
   * Returns the currently selected option. 
   * 
   * @type {ChoiceOption}
   * @readonly
   */
  get selected() {
    const valueAsChoice = this.adapter.toChoiceOption(this.value);
    return this.options.find(option => option.value === valueAsChoice.value);
  }

  /**
   * Returns the localized value. 
   * 
   * @type {String}
   * @readonly
   * @override
   */
  get localizedValue() {
    return this.selected.localizedValue ?? "";
  }

  /**
   * @param {String | undefined} args.id Optional. Unique ID of this view model instance. 
   * 
   * @param {String} args.propertyPath The path used to look up the value. 
   * @param {Object} args.propertyOwner An object on which to to look up the value. 
   * @param {Boolean | undefined} args.isEditable Optional. If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
   * @param {String | undefined} args.contextTemplate Optional. Name or path of a template that embeds this input component. 
   * @param {String | undefined} args.localizableTitle Optional. The localizable title (tooltip). 
   * 
   * @param {Array<ChoiceOption>} args.options The options available to the drop-down. 
   * @param {ChoiceAdapter} adapter A `ChoiceOption` adapter. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["propertyPath", "propertyOwner", "options", "adapter"]);
  }
  
  /**
   * @override
   * 
   * @throws {Error} UnknownException Thrown if the current option could not be set correctly. 
   */
  async activateListeners(html, isOwner, isEditable) {
    await super.activateListeners(html, isOwner, isEditable);

    if (isEditable !== true) return;
    
    // Ensure correct option of drop-down is set. 
    try {
      const optionElements = this.element.find('option');
      const choice = this.adapter.toChoiceOption(this.value);
      for(let i = 0; i < optionElements.length; i++) {
        const optionElement = optionElements[i];
        if (optionElement.value === choice.value) {
          this.element[0].selectedIndex = i;
          break;
        }
      }
    } catch (error) {
      throw new Error("UnknownException: Failed to set the current drop-down option", { cause: error });
    }
  }
}