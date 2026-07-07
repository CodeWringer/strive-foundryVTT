import { ValidationUtil } from "../../common/util/validation-utility.mjs";

/**
 * Represents a choice option for drop-downs, radio-buttons or check-boxes. 
 * 
 * @property {String} value The actual value. 
 * @property {String | undefined} localizedValue The text that represents the value, to display to the user. 
 * @property {String | undefined} iconLightMode A (relative) icon file path or a FontAwesome icon class. 
 * * E.g. `"systems/strive/presentation/image/texture.svg"`
 * * E.g. `"fas fa-plus"`
 * @property {String | undefined} iconDarkMode A (relative) icon file path or a FontAwesome icon class. 
 * * E.g. `"systems/strive/presentation/image/texture.svg"`
 * * E.g. `"fas fa-plus"`
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
  #iconLightMode = undefined;
  /**
   * A (relative) icon file path or a FontAwwesome icon class. 
   * 
   * * E.g. `"systems/strive/presentation/image/texture.svg"`
   * * E.g. `"fas fa-plus"`
   * @type {String | undefined}
   * @readonly
   */
  get iconLightMode() { return this.#iconLightMode; }

  /**
   * @type {String | undefined}
   * @private
   */
  #iconDarkMode = undefined;
  /**
   * A (relative) icon file path or a FontAwwesome icon class. 
   * 
   * * E.g. `"systems/strive/presentation/image/texture.svg"`
   * * E.g. `"fas fa-plus"`
   * @type {String | undefined}
   * @readonly
   */
  get iconDarkMode() { return this.#iconDarkMode; }

  /**
   * Returns an HTML representing string containing the light and dark mode icons, 
   * neatly wrapped in a div to be easily inserted into the DOM. 
   * @type {String}
   * @readonly
   */
  get iconHtml() {
    let iconLightMode = "";
    if (ValidationUtil.isDefined(this.iconLightMode)) {
      if ((this.iconLightMode.startsWith("fas fa-") || this.iconLightMode.startsWith("ico"))) {
        iconLightMode = `<i class="${this.iconLightMode} light-mode"></i>`;
      } else {
        iconLightMode = `<img src="${this.iconLightMode}" class="light-mode">`;
      }
    }

    let iconDarkMode = "";
    if (ValidationUtil.isDefined(this.iconDarkMode)) {
      if ((this.iconDarkMode.startsWith("fas fa-") || this.iconDarkMode.startsWith("ico"))) {
        iconDarkMode = `<i class="${this.iconDarkMode} dark-mode"></i>`;
      } else {
        iconDarkMode = `<img src="${this.iconDarkMode}" class="dark-mode">`;
      }
    }

    if (iconLightMode.length > 0 || iconDarkMode.length > 0) {
      return `<div>${iconLightMode}${iconDarkMode}</div>`
    } else {
      return "";
    }
  }

  /**
   * @param {Object} args
   * @param {String} args.value The actual value. 
   * @param {String | undefined} args.localizedValue The text that represents the value, 
   * to display to the user. 
   * @param {String | undefined} args.iconLightMode A (relative) icon file path or a FontAwesome icon class. 
   * * E.g. `"systems/strive/presentation/image/texture.svg"`
   * * E.g. `"fas fa-plus"`
   * @param {String | undefined} args.iconDarkMode A (relative) icon file path or a FontAwesome icon class. 
   * * E.g. `"systems/strive/presentation/image/texture.svg"`
   * * E.g. `"fas fa-plus"`
   */
  constructor(args = {}) {
    this.#value = args.value;
    this.#localizedValue = args.localizedValue;
    this.#iconLightMode = args.iconLightMode;
    this.#iconDarkMode = args.iconDarkMode;
  }
}