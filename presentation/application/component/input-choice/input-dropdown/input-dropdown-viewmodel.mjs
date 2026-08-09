import ChoiceOption from "../../../../model/choice-option.mjs";
import { TEMPLATES } from "../../../templates.mjs";
import ButtonDropDownViewModel from "../../button-dropdown/button-dropdown-viewmodel.mjs";
import { DropDownOption } from "../../button-dropdown/dropdown-option.mjs";
import InputChoiceViewModel from "../input-choice-viewmodel.mjs";

/**
 * Represents a drop-down input. The user can select one of a defined list of options. 
 * 
 * @extends InputChoiceViewModel
 * 
 * @property {ChoiceOption} value The currently selected option. 
 * @property {Array<ChoiceOption>} options Gets the options available to the drop-down. 
 * @property {Boolean} showValue If true, will add the value to the content of the 
 * drop-down button. 
 * 
 * @method onChange Callback that is invoked when the value changes. 
 * Receives the following arguments: 
 * * `oldValue: {ChoiceOption}`
 * * `newValue: {ChoiceOption}`
 * @method onInput Callback that is invoked when any input is made (by keyboard or mouse or other input device). 
 * * `event: {Event}`
 * * `viewModel: {ViewModel}`
 * @method onFocus Callback that is invoked when the input element is focused. 
 * * `event: {Event}`
 * * `viewModel: {ViewModel}`
 * @method onFocusLost Callback that is invoked when the input element is unfocused. 
 * * `event: {Event}`
 * * `viewModel: {ViewModel}`
 */
export default class InputDropDownViewModel extends InputChoiceViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.application.component.dropDown; }

  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
   */
  static registerHandlebarsPartial() {
    Handlebars.registerPartial('inputDropDown', `{{> "${InputDropDownViewModel.TEMPLATE}"}}`);
  }

  /** @override */
  get clazz() { return InputDropDownViewModel; }

  /**
   * @type {ChoiceOption}
   */
  get value() { return super.value; }
  /**
   * @param {ChoiceOption} value 
   */
  set value(value) {
    super.value = value;

    let newContent = value.iconHtml;
    if (this.showValue) {
      newContent = `${newContent}<span>${value.localizedValue}</span>`;
    }
    
    this.#editValueElement.empty();
    this.#editValueElement.append(newContent);

    this.#readModeElement.empty();
    this.#readModeElement.append(newContent);
  }

  /**
   * Initialized late - in `activateListeners`!
   * @type {JQuery}
   * @readonly
   * @private
   */
  #readModeElement = undefined;

  /**
   * Initialized late - in `activateListeners`!
   * @type {JQuery}
   * @readonly
   * @private
   */
  #editValueElement = undefined;

  /**
   * @param {Object} args 
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * @param {Boolean | undefined} args.isEditable If `true`, input(s) will 
   * be in edit mode. If `false`, will be in read-only mode.
   * * default `false`. 
   * 
   * @param {String | undefined} args.localizedToolTip A localized text to 
   * display as a tool tip. 
   * 
   * @param {ChoiceOption | undefined} args.value The current value. 
   * * default is the first option given.
   * @param {Boolean | undefined} args.suppressAnims If `true`, suppresses animations that would play when 
   * `isEditable` is changed at run-time. Useful for when this component is child to another, which 
   * instead handles the animations. 
   * @param {Array<ChoiceOption>} args.options The options available to the drop-down. 
   * @param {Function | undefined} args.onChange Callback that is invoked 
   * when the value changes. Receives two arguments: 
   * * `oldValue: {ChoiceOption}`
   * * `newValue: {ChoiceOption}`
   * 
   * @param {Boolean | undefined} args.showValue If true, will add the value to the content of the 
   * drop-down button. 
   * * default `true`
   */
  constructor(args = {}) {
    super(args);

    this.showValue = args.showValue ?? true;
    this.vmDropDown = new ButtonDropDownViewModel({
      id: "vmDropDown",
      parent: this,
      options: args.options.map(option => new DropDownOption({
        value: option.value,
        localizedValue: option.localizedValue,
        iconCssClass: option.iconCssClass,
        iconLightMode: option.iconLightMode,
        iconDarkMode: option.iconDarkMode,
        onClick: () => {
          this.value = option;
        },
      })),
    });
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);

    this.#editValueElement = this.element.find(".edit-value");
    this.#readModeElement = this.element.find("> .read-mode");

    // Ensure the correct value is displayed initially. 
    let newContent = this.value.iconHtml;
    if (this.showValue) {
      newContent = `${newContent}<span>${this.value.localizedValue}</span>`;
    }

    this.#editValueElement.empty();
    this.#editValueElement.append(newContent);
  }
}
