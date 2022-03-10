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
 * @property {Number | undefined} min Gets the minimum value. 
 * @property {Number | undefined} max Gets the maximum value. 
 * @property {Boolean} hasMin Returns true, if the minimum value is defined. 
 * @property {Boolean} hasMax Returns true, if the maximum value is defined. 
 * @property {Number} step Gets the increment/decrement step size. 
 * 
 */
export default class InputNumberSpinnerViewModel extends InputViewModel {
  static get TEMPLATE() { return TEMPLATES.COMPONENT_INPUT_NUMBER_SPINNER; }

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
   * @param {String | undefined} args.id
   * 
   * @param {Boolean | undefined} args.isEditable 
   * @param {String} args.propertyPath
   * @param {Object} args.propertyOwner
   * @param {String | undefined} contextTemplate
   * 
   * @param {Number} min Gets the minimum value. 
   * @param {Number} max Gets the maximum value. 
   * @param {Number} step Gets the increment/decrement step size. 
   */
  constructor(args = {}) {
    super(args);
    this.min = args.min ?? undefined;
    this.max = args.max ?? undefined;
    this.step = args.step ?? 1;
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

Handlebars.registerHelper('createNumberSpinnerViewModel', function(id, isEditable, propertyOwner, propertyPath, step, min, max, contextTemplate) {
  return new InputNumberSpinnerViewModel({
    id: id,
    isEditable: isEditable,
    propertyOwner: propertyOwner,
    propertyPath: propertyPath,
    step: step ?? 1,
    min: min,
    max: max,
    contextTemplate: contextTemplate,
  });
});
Handlebars.registerPartial('inputNumberSpinner', `{{> "${InputNumberSpinnerViewModel.TEMPLATE}"}}`);
