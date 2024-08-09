import InputViewModel from "../../view-model/input-view-model.mjs";

/**
 * A button that allows toggling a boolean value with a check box. 
 * 
 * @extends InputViewModel
 * 
 * @property {Boolean} value The value of the boolean property. 
 * 
 * @method onChange Callback that is invoked when the value changes. 
 * Receives the following arguments: 
 * * `oldValue: {Boolean}`
 * * `newValue: {Boolean}`
 */
export default class ButtonCheckBoxViewModel extends InputViewModel {
  static get TEMPLATE() { return game.strive.const.TEMPLATES.COMPONENT_BUTTON_CHECKBOX; }

  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
   */
  static registerHandlebarsPartial() {
    Handlebars.registerPartial('buttonCheckbox', `{{> "${ButtonCheckBoxViewModel.TEMPLATE}"}}`);
  }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * @param {Boolean | undefined} args.isEditable If `true`, input(s) will 
   * be in edit mode. If `false`, will be in read-only mode.
   * * default `false`. 
   * @param {String | undefined} args.localizedToolTip A localized text to 
   * display as a tool tip. 
   * @param {Boolean | undefined} args.value The current value. 
   * * default `false`
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
    });
  }
}
