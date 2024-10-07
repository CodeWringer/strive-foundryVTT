import { ValidationUtil } from "../../../business/util/validation-utility.mjs";
import ButtonViewModel from "../button/button-viewmodel.mjs";

/**
 * A button that allows toggling a specific boolean value. 
 * 
 * Toggles between two given icons, based on the boolean value. 
 * 
 * @extends ButtonViewModel
 * 
 * @property {Boolean} value The current toggle state. 
 * @property {String} iconActive An HTML-String of the "active" icon. 
   * * E. g. `"<i class="fas fa-eye"></i>"`
 * @property {String} iconInactive An HTML-String of the "inactive" icon. 
   * * E. g. `"<i class="fas fa-eye-slash"></i>"`
 * 
 * @method onClick Asynchronous callback that is invoked when 
 * the button is clicked. Arguments: 
 * * `event: Event`
 * * `data: Boolean` - The current toggle state. 
 */
export default class ButtonToggleIconViewModel extends ButtonViewModel {
  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
  */
 static registerHandlebarsPartial() {
    Handlebars.registerPartial('buttonToggleIcon', `{{> "${ButtonToggleIconViewModel.TEMPLATE}"}}`);
  }

  /**
   * Returns the current toggle state. 
   * 
   * @type {Boolean}
   */
  get value() { return this._value; }
  /**
   * Sets the toggle state and updates the rendered icon. 
   * 
   * @type {Boolean}
   */
  set value(newValue) {
    this._value = newValue;
    this._updateIcon();
  }

  /**
   * @param {Object} args 
   * @param {Boolean | undefined} args.value The toggle state. 
   * * default `false` 
   * @param {String} args.iconActive An HTML-String of the "active" icon. 
   * * E. g. `"<i class="fas fa-eye"></i>"`
   * @param {String} args.iconInactive An HTML-String of the "inactive" icon. 
   * * E. g. `"<i class="fas fa-eye-slash"></i>"`
   * @param {Function | undefined} args.onClick Asynchronous callback that is invoked when 
   * the button is clicked. Arguments: 
   * * `event: Event`
   * * `data: Boolean` - The current toggle state. 
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["iconActive", "iconInactive"]);

    this._value = args.value ?? false;
    this.iconActive = args.iconActive;
    this.iconInactive = args.iconInactive;

    this.iconHtml = this._getIconHtml();
  }

  /** @override */
  async _onClick(event) {
    if (this.isEditable !== true) return;
    
    this.value = !this.value;

    return this.value;
  }

  /**
   * Returns the complete HTML snippet that represents the toggle state icon. 
   * 
   * @returns {String} The complete HTML snippet that represents the toggle state icon. 
   * 
   * @private
   */
  _getIconHtml() {
    const icon = this.value === true ? this.iconActive : this.iconInactive;
    return `<span id="${this.id}-icon">${icon}</span>`;
  }

  /**
   * Synchronizes the icon HTML with the current toggle state. 
   * 
   * @private
   */
  _updateIcon() {
    this.iconHtml = this._getIconHtml();
    this.element.html(this.iconHtml);
  }
}
