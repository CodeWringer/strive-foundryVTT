/**
 * Represents a choice option for drop-downs, radio-buttons or check-boxes. 
 * @property {Any} value The actual value. 
 * @property {String} localizedValue The text that represents the value, displayed to the user. 
 */
export default class ChoiceOption {
  /**
   * @type {Any}
   * @private
   */
  _value = undefined;
  /**
   * @type {Any}
   */
  get value() { return this._value; }

  /**
   * @type {String}
   * @private
   */
  _localizedValue = "";
  /**
   * @type {String}
   */
  get localizedValue() { return this._localizedValue; }

  /**
   * @param {Any} value The actual value. 
   * @param {String} localizedValue The text that represents the value, displayed to the user. 
   */
  constructor(value, localizedValue) {
    this._value = value;
    this._localizedValue = localizedValue;
  }
}