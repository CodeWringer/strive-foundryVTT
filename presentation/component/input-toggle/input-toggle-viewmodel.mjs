import { TEMPLATES } from "../../templatePreloader.mjs";
import InputViewModel from "../../view-model/input-view-model.mjs";

/**
 * Toggles a boolean value via a "knob" button. 
 * 
 * @extends InputViewModel
 * 
 * @property {Boolean} value The current value. 
 * 
 * @method onChange Callback that is invoked when the value changes. 
 * Receives the following arguments: 
 * * `oldValue: {Boolean}`
 * * `newValue: {Boolean}`
 */
export default class InputToggleViewModel extends InputViewModel {
  static get TEMPLATE() { return TEMPLATES.COMPONENT_INPUT_TOGGLE; }

  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
   */
  static registerHandlebarsPartial() {
    Handlebars.registerPartial('inputToggle', `{{> "${InputToggleViewModel.TEMPLATE}"}}`);
  }

  /**
   * @param {Object} args 
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * @param {Boolean | undefined} args.isEditable If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
   * 
   * @param {Boolean | undefined} args.value The current value. 
   * 
   * @param {Function | undefined} args.onChange Callback that is invoked 
   * when the value changes. Receives two arguments: 
   * * `oldValue: {Boolean}`
   * * `newValue: {Boolean}`
   */
  constructor(args = {}) {
    super(args);

    this._value = args.value ?? false;
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);

    html.find(`#${this.id}-button`).click(() => {
      if (this.isEditable !== true) return;
      
      this.value = !this.value;
      if (this.value === true) {
        html.find(`button.component-button-toggle`).addClass("active");
        html.find(`span.component-button-toggle-knob`).addClass("active");
      } else {
        html.find(`button.component-button-toggle`).removeClass("active");
        html.find(`span.component-button-toggle-knob`).removeClass("active");
      }
    });
  }
}
