import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import { TEMPLATES } from "../../template/templatePreloader.mjs";
import InputViewModel from "../../view-model/input-view-model.mjs";

/**
 * Represents a drop-down input. The user can select one of a defined list of options. 
 * 
 * @extends InputViewModel
 * 
 * @property {String} localizedValue Gets the localized version of the value. 
 * @property {ChoiceOption} selected Gets the currently selected option. 
 * @property {Array<ChoiceOption>} options Gets the options available to the drop-down. 
 */
export default class InputDropDownViewModel extends InputViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.COMPONENT_INPUT_DROPDOWN; }

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
   * @param {String | undefined} args.id Optional. Unique ID of this view model instance. 
   * 
   * @param {String} args.propertyPath The path used to look up the value. 
   * @param {Object} args.propertyOwner An object on which to to look up the value. 
   * @param {Boolean | undefined} args.isEditable Optional. If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
   * @param {String | undefined} args.contextTemplate Optional. Name or path of a template that embeds this input component. 
   * @param {String | undefined} args.localizableTitle Optional. The localizable title (tooltip). 
   * 
   * @param {Array<ChoiceOption>} args.options The options available to the drop-down. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["propertyPath", "propertyOwner", "options"]);

    this.options = args.options ?? [];
  }

  /**
   * @override
   * @see "module\components\input-viewmodel.mjs"
   * @throws {Error} UnknownException Thrown if the current option could not be set correctly. 
   */
  activateListeners(html, isOwner, isEditable) {
    super.activateListeners(html, isOwner, isEditable);

    if (isEditable !== true) return;

    // Ensure correct option of drop-down is set. 
    try {
      const optionElements = this.element.find('option');
      const value = this.value;
      for(let i = 0; i < optionElements.length; i++) {
        const optionElement = optionElements[i];
        if (optionElement.value === value) {
          this.element[0].selectedIndex = i;
          break;
        }
      }
    } catch (error) {
      throw new Error("UnknownException: Failed to set the current drop-down option", { cause: error });
    }
  }
}

Handlebars.registerPartial('inputDropDown', `{{> "${InputDropDownViewModel.TEMPLATE}"}}`);
