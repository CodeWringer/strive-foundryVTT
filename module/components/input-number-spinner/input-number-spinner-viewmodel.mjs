import { TEMPLATES } from "../../templatePreloader.mjs";
import InputViewModel from "../input-viewmodel.mjs";

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
 * @property {Number | undefined} min Gets the minimum value. 
 * @property {Number | undefined} max Gets the maximum value. 
 * @property {Boolean} hasMin Returns true, if the minimum value is defined. 
 * @property {Boolean} hasMax Returns true, if the maximum value is defined. 
 * @property {Number} step Gets the increment/decrement step size. 
 * 
 */
export default class InputNumberSpinnerViewModel extends InputViewModel {
  static get template() { return TEMPLATES.COMPONENT_INPUT_NUMBER_SPINNER; }

  /**
   * Returns true, if the minimum value is defined. 
   * @type {Boolean}
   * @readonly
   */
  get hasMin() { return this.min !== undefined; }
  /**
   * Returns true, if the maximum value is defined. 
   * @type {Boolean}
   * @readonly
   */
  get hasMax() { return this.max !== undefined; }

  /**
   * @param {Boolean | undefined} args.isEditable 
   * @param {String | undefined} args.id
   * @param {String} args.propertyPath
   * @param {Object} args.propertyOwner
   * @param {Number} min Gets the minimum value. 
   * @param {Number} max Gets the maximum value. 
   * @param {Number} step Gets the increment/decrement step size. 
   */
  constructor(args = {}) {
    super(args);
    args = {
      min: undefined,
      max: undefined,
      step: 1,
      ...args,
    }
    this.min = args.min;
    this.max = args.max;
    this.step = args.step;
  }

  /**
   * @override
   * @see "module\components\input-viewmodel.mjs"
   */
  activateListeners(html, isOwner, isEditable) {
    super.activateListeners(html, isOwner, isEditable);

    if (isEditable !== true) return;

    // No binding necessary, as the DOM is the only required context. 
    this.element.parent().find(".button-spinner-up").click(this._onClickNumberSpinnerUp.bind(this));
    this.element.parent().find(".button-spinner-down").click(this._onClickNumberSpinnerDown.bind(this));
  }

  _onClickNumberSpinnerUp(event) {
    const newValue = parseInt(this.value) + 1;
    if (this.max !== undefined && newValue > this.max) return;
    this.value = newValue;
  }

  _onClickNumberSpinnerDown(event) {
    const newValue = parseInt(this.value) - 1;
    if (this.min !== undefined && newValue < this.min) return;
    this.value = newValue;
  }
}

Handlebars.registerHelper('createInputNumberSpinnerViewModel', function(isEditable, propertyOwner, propertyPath, step, min, max) {
  const vm = new InputNumberSpinnerViewModel({
    isEditable: isEditable,
    propertyOwner: propertyOwner,
    propertyPath: propertyPath,
    step: step,
    min: min,
    max: max
  });

  // Add new view model instance to global collection. 
  game.ambersteel.viewModels.set(vm.id, vm);

  return vm;
});
Handlebars.registerPartial('_inputNumberSpinner', `{{#> "${TEMPLATES.COMPONENT_INPUT_NUMBER_SPINNER}"}}{{/"${TEMPLATES.COMPONENT_INPUT_NUMBER_SPINNER}"}}`);
Handlebars.registerPartial('inputNumberSpinner', `{{> _inputNumberSpinner vm=(createInputNumberSpinnerViewModel isEditable propertyOwner propertyPath (isDefined step 1) min max) cssClass=(isDefined cssClass "") readOnlyCssClass=(isDefined readOnlyCssClass "") }}`);
