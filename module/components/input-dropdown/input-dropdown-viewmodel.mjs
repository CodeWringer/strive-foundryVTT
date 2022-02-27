import { TEMPLATES } from "../../templatePreloader.mjs";
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

  get selected() {
    return this.options.find(option => option.value === this.value);
  }

  get localizedValue() {
    if (this.selected !== undefined) {
      return this.selected.localizedValue;
    } else {
      return "";
    }
  }

  /**
   * @param {String | undefined} args.id
   * 
   * @param {Boolean | undefined} args.isEditable 
   * @param {String} args.propertyPath
   * @param {Object} args.propertyOwner
   * @param {String | undefined} contextTemplate
   * 
   * @param {Array<ChoiceOption>} args.options
   */
  constructor(args = {}) {
    super(args);
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

Handlebars.registerHelper('createInputDropDownViewModel', function(isEditable, propertyOwner, propertyPath, options, contextTemplate) {
  const vm = new InputDropDownViewModel({
    isEditable: isEditable,
    propertyOwner: propertyOwner,
    propertyPath: propertyPath,
    options: options,
    contextTemplate: contextTemplate,
  });

  // Add new view model instance to global collection. 
  game.ambersteel.viewModels.set(vm.id, vm);

  return vm;
});
Handlebars.registerPartial('_inputDropDown', `{{#> "${InputDropDownViewModel.TEMPLATE}"}}{{/"${InputDropDownViewModel.TEMPLATE}"}}`);
Handlebars.registerPartial('inputDropDown', `{{> _inputDropDown vm=(createInputDropDownViewModel isEditable propertyOwner propertyPath options contextTemplate) cssClass=(isDefined cssClass "") readOnlyCssClass=(isDefined readOnlyCssClass "") }}`);
