import { validateOrThrow } from "../../../../business/util/validation-utility.mjs";
import { TEMPLATES } from "../../../templatePreloader.mjs";
import InputChoiceViewModel from "../input-choice-viewmodel.mjs";

/**
 * Represents a drop-down input. The user can select one of a defined list of options. 
 * 
 * @extends InputChoiceViewModel
 * 
 * @property {ChoiceOption} value The currently selected option. 
 * @property {Array<ChoiceOption>} options Gets the options available to the drop-down. 
 * @method onChange Callback that is invoked when the value changes. 
 * Receives the following arguments: 
 * * `oldValue: {ChoiceOption}`
 * * `newValue: {ChoiceOption}`
 */
export default class InputDropDownViewModel extends InputChoiceViewModel {
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

  /**
   * @param {Object} args
   * 
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * @param {ViewModel | undefined} args.parent Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If `true`, input(s) will 
   * be in edit mode. If `false`, will be in read-only mode.
   * * default `false`. 
   * 
   * @param {String | undefined} args.localizedToolTip A localized text to 
   * display as a tool tip. 
   * @param {String | undefined} args.iconHtml Raw HTML to render as 
   * an associated icon. E. g. `'<i class="fas fa-scroll"></i>'`
   * 
   * @param {ChoiceOption | undefined} args.value The current value. 
   * * default ist the first element of `args.options`
   * @param {Array<ChoiceOption>} args.options The options available to the drop-down. 
   * @param {ChoiceAdapter} args.adapter A `ChoiceOption` adapter. 
   * @param {Function | undefined} args.onChange Callback that is invoked 
   * when the value changes. Receives two arguments: 
   * * `oldValue: {ChoiceOption}`
   * * `newValue: {ChoiceOption}`
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["options", "adapter"]);
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
