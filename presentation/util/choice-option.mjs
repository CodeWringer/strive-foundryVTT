/**
 * Represents a choice option for drop-downs, radio-buttons or check-boxes. 
 * 
 * @property {String} value The actual value. 
 * @property {String | undefined} localizedValue The text that represents the value, to display to the user. 
 * @property {String | undefined} icon A (relative) icon file path or a FontAwwesome icon class. 
 * * E.g. `"systems/ambersteel/presentation/image/texture.svg"`
 * * E.g. `"fas fa-plus"`
 * @property {Boolean} shouldDisplayValue Gets or sets whether the value should be displayed. 
 * @property {Boolean} shouldDisplayIcon Gets or sets whether the icon should be displayed. 
 * @property {String | undefined} displayHtmlOverride Gets or sets the raw HTML to display as the content. 
 * * If not undefined, this value should take precedence over both localizedValue and icon, 
 * and be used instead!
 */
export default class ChoiceOption {
  /**
   * @type {String}
   * @private
   */
  _value = undefined;
  /**
   * The actual value. 
   * @type {String}
   * @readonly
   */
  get value() { return this._value; }

  /**
   * @type {String | undefined}
   * @private
   */
  _localizedValue = undefined;
  /**
   * The text that represents the value, to display to the user. 
   * @type {String | undefined}
   * @readonly
   */
  get localizedValue() { return this._localizedValue; }

  /**
   * @type {String | undefined}
   * @private
   */
  _icon = undefined;
  /**
   * A (relative) icon file path or a FontAwwesome icon class. 
   * 
   * * E.g. `"systems/ambersteel/presentation/image/texture.svg"`
   * * E.g. `"fas fa-plus"`
   * @type {String | undefined}
   * @readonly
   */
  get icon() { return this._icon; }

  /**
   * Returns true, if the icon string represents a FontAwesome icon class. 
   * @returns {Boolean}
   */
  iconIsFontAwesome() {
    if (this.icon !== undefined && this.icon.startsWith("fas fa-")) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Gets or sets whether the value should be displayed. 
   * @type {Boolean}
   * @default true
   */
  shouldDisplayValue = true;
  
  /**
   * Gets or sets whether the icon should be displayed. 
   * @type {Boolean}
   * @default true
   */
  shouldDisplayIcon = true;

  /**
   * Gets or sets the raw HTML to display as the content. 
   * 
   * If not undefined, this value should take precedence over both localizedValue and icon, 
   * and be used instead!
   * @type {String | undefined}
   */
  displayHtmlOverride = undefined;

  /**
   * @param {String} args.value The actual value. 
   * @param {String | undefined} args.localizedValue Optional. The text that represents the value, 
   * to display to the user. 
   * @param {String | undefined} args.icon Optional. A (relative) icon file path or a FontAwwesome icon class. 
   * 
   * E.g. "systems/ambersteel/presentation/image/texture.svg" or 
   * e.g. "fas fa-plus"
   * @param {Boolean | undefined} shouldDisplayValue Optional. Sets whether the value should be displayed. Default true. 
   * @param {Boolean | undefined} shouldDisplayIcon Optional. Sets whether the icon should be displayed. Default true. 
   * @param {Boolean | undefined} displayHtmlOverride Optional. Sets the raw HTML to display as the content. 
   */
  constructor(args = {}) {
    this._value = args.value;
    this._localizedValue = args.localizedValue;
    this._icon = args.icon;
    this.shouldDisplayValue = args.shouldDisplayValue ?? true;
    this.shouldDisplayIcon = args.shouldDisplayIcon ?? true;
    this.displayHtmlOverride = args.displayHtmlOverride;
  }
}