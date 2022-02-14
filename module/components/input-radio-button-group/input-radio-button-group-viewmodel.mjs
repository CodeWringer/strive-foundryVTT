import { TEMPLATES } from "../../templatePreloader.mjs";
import InputViewModel from "../input-viewmodel.mjs";
import { selectItemByValue } from "../../utils/sheet-utility.mjs";

/**
 * --- Inherited from ViewModel
 * 
 * @property {Boolean} isEditable If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
 * @property {String} id Optional. Id used for the HTML element's id and name attributes. 
 * @property {String} template Static. Returns the template this ViewModel is intended for. 
 * 
 * --- Inherited from InputViewModel
 * 
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
export default class InputRadioButtonGroupViewModel extends InputViewModel {
  static get template() { return TEMPLATES.COMPONENT_INPUT_RADIO_BUTTON_GROUP; }
  static get activeCssClass() { return "active" }

  get selected() {
    return this.options.find(option => option.value === this.value);
  }

  get localizedValue() {
    return this.selected.localizedValue;
  }

  /**
   * @type {HTMLElement}
   * @private
   */
  _lastChecked = undefined;
  /**
   * @type {HTMLElement}
   * @readonly
   */
  get lastChecked() { return this._lastChecked; }

  /**
   * @param {Boolean | undefined} args.isEditable 
   * @param {String | undefined} args.id
   * @param {String} args.propertyPath
   * @param {Object} args.propertyOwner
   * @param {Array<ChoiceOption>} args.options
   */
  constructor(args = {}) {
    super(args);
    args = {
      options: [],
      ...args,
    }
    this.options = args.options;
  }

  /**
   * @override
   * @see "module\components\input-viewmodel.mjs"
   * @throws {Error} NullPointerException Thrown if the radio button container could not be found. 
   */
  activateListeners(html, isOwner, isEditable) {
    super.activateListeners(html, isOwner, isEditable);

    if (isEditable !== true) return;

    const radioButtonContainer = this.element.find(".radio-button-container");

    if (radioButtonContainer === undefined) {
      throw new Error("NullPointerException: Failed to find radio button container");
    }

    const radioButtons = radioButtonContainer.find('.radio-button');
    for (const radioButton of radioButtons) {
      // Hook up events on radio button options. 
      radioButton.onchange = (event) => {
        this.value = event.currentTarget.value;
        this._setChecked(event.currentTarget);

        if (this._lastChecked !== undefined) {
          this._setUnchecked(this._lastChecked);
        }
        this._lastChecked = event.currentTarget;
      };
      
      // Ensure correct option of radio-buttons is set.
      if (this.value == radioButton.value) {
        this._setChecked(radioButton);

        if (this._lastChecked !== undefined) {
          this._setUnchecked(this._lastChecked);
        }
        this._lastChecked = radioButton;
      }
    }
  }

  /**
   * @param {HTMLElement} radioButton 
   * @private
   */
  _setChecked(radioButton) {
    radioButton.checked = true;
    const parent = this.element.find('#' + radioButton.id).parent();
    parent.addClass(InputRadioButtonGroupViewModel.activeCssClass);
  }
  
  /**
   * @param {HTMLElement} radioButton 
   * @private
   */
  _setUnchecked(radioButton) {
    radioButton.checked = false;
    const parent = this.element.find('#' + radioButton.id).parent();
    parent.removeClass(InputRadioButtonGroupViewModel.activeCssClass);
  }
}

Handlebars.registerHelper('createInputRadioButtonGroupViewModel', function(isEditable, propertyOwner, propertyPath, options) {
  const vm = new InputRadioButtonGroupViewModel({
    isEditable: isEditable,
    propertyOwner: propertyOwner,
    propertyPath: propertyPath,
    options: options
  });

  // Add new view model instance to global collection. 
  game.ambersteel.viewModels.set(vm.id, vm);

  return vm;
});
Handlebars.registerPartial('_inputRadioButtonGroup', `{{#> "${TEMPLATES.COMPONENT_INPUT_RADIO_BUTTON_GROUP}"}}{{/"${TEMPLATES.COMPONENT_INPUT_RADIO_BUTTON_GROUP}"}}`);
Handlebars.registerPartial('inputRadioButtonGroup', `{{> _inputRadioButtonGroup vm=(createInputRadioButtonGroupViewModel isEditable propertyOwner propertyPath options) cssClass=(isDefined cssClass "") readOnlyCssClass=(isDefined readOnlyCssClass "") }}`);
