import { ValidationUtil } from "../../common/util/validation-utility.mjs";

/**
 * Represents a choice option for drop-downs, radio-buttons or check-boxes. 
 * 
 * @property {String} value The actual value. 
 * @property {String | undefined} localizedValue The text that represents the value, to display to the user. 
 * @property {String | undefined} icon A (relative) icon file path or a FontAwwesome icon class. 
 * * E.g. `"systems/strive/presentation/image/texture.svg"`
 * * E.g. `"fas fa-plus"`
 * @property {Boolean} hasIcon Returns `true`, if an icon is defined. 
 * * Read-only
 * @property {Boolean} hasIconClass Returns true, if the icon string represents a FontAwesome or custom icon CSS class. 
 * * Read-only
 */
export default class ChoiceOption {
  /**
   * @type {String}
   * @private
   */
  #value = undefined;
  /**
   * The actual value. 
   * @type {String}
   * @readonly
   */
  get value() { return this.#value; }

  /**
   * @type {String | undefined}
   * @private
   */
  #localizedValue = undefined;
  /**
   * The text that represents the value, to display to the user. 
   * @type {String | undefined}
   * @readonly
   */
  get localizedValue() { return this.#localizedValue; }

  /**
   * @type {String | undefined}
   * @private
   */
  #icon = undefined;
  /**
   * A (relative) icon file path or a FontAwwesome icon class. 
   * 
   * * E.g. `"systems/strive/presentation/image/texture.svg"`
   * * E.g. `"fas fa-plus"`
   * @type {String | undefined}
   * @readonly
   */
  get icon() { return this.#icon; }

  /**
   * Returns `true`, if an icon is defined. 
   * @type {Boolean}
   * @readonly
   */
  get hasIcon() { return ValidationUtil.isDefined(this.icon); }

  /**
   * Returns true, if the icon string represents a FontAwesome or custom icon CSS class. 
   * @returns {Boolean}
   * @readonly
   */
  get hasIconClass() {
    if (ValidationUtil.isDefined(this.icon) && (this.icon.startsWith("fas fa-") || this.icon.startsWith("ico"))) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * @param {Object} args
   * @param {String} args.value The actual value. 
   * @param {String | undefined} args.localizedValue The text that represents the value, 
   * to display to the user. 
   * @param {String | undefined} args.icon A (relative) icon file path or a FontAwesome icon class. 
   * * E.g. `"systems/strive/presentation/image/texture.svg"`
   * * E.g. `"fas fa-plus"`
   */
  constructor(args = {}) {
    this.#value = args.value;
    this.#localizedValue = args.localizedValue;
    this.#icon = args.icon;
  }
}