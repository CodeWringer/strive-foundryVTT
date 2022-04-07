import { TEMPLATES } from "../../templatePreloader.mjs";
import { validateOrThrow } from "../../utils/validation-utility.mjs";
import InputViewModel from "../input-viewmodel.mjs";

/**
 * --- Inherited from ViewModel
 * 
 * @property {Boolean} isEditable If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
 * @property {String} id Optional. Id used for the HTML element's id and name attributes. 
 * @property {String} TEMPLATE Static. Returns the template this ViewModel is intended for. 
 * 
 * --- Inherited from InputViewModel
 * 
 * @property {JQuery | HTMLElement} element The button element on the DOM. 
 * @property {String} propertyPath The path used to look up the value. 
 * @property {Object} propertyOwner An object on which to to look up the value. 
 * @property {Any} value Gets or sets the looked up value. 
 * 
 * --- Own properties
 * 
 * @property {String} localizedValue Gets the localized version of the value. 
 * @property {ChoiceOption} selected Gets the currently selected option. 
 * @property {Array<ChoiceOption>} options Gets the options available to the drop-down. 
 * 
 */
export default class InputDropDownViewModel extends InputViewModel {
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

Handlebars.registerHelper('createDropDownViewModel', function(id, isEditable, propertyOwner, propertyPath, options, contextTemplate) {
  return new InputDropDownViewModel({
    id: id,
    isEditable: isEditable,
    propertyOwner: propertyOwner,
    propertyPath: propertyPath,
    options: options,
    contextTemplate: contextTemplate,
  });
});
Handlebars.registerPartial('inputDropDown', `{{> "${InputDropDownViewModel.TEMPLATE}"}}`);
