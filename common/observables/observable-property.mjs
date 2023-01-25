/**
 * @property {any} value
 */
export default class ObservableProperty {
  /**
   * @type {any}
   * @private
   */
  _value = undefined;

  /**
   * @type {any}
   */
  get value() { return this._value; }
  set value(value) {
    const oldValue = this._value;
    this._value = value;
    this.onChange(oldValue, value);
  }

  /**
   * @param {object} args 
   * @param {any} args.value
   * @param {Function | undefined} args.onChange Callback function that is invoked 
   * whenever the value is changed. 
   */
  constructor(args = {}) {
    this._value = args.value;
    this.onChange = args.onChange ?? this.onChange;
  }

  /**
   * Invoked whenever the value is changed. 
   * 
   * @param {any} oldValue 
   * @param {any} newValue 
   * 
   * @virtual
  */
 onChange(oldValue, newValue) { /* Implementation up to user. */}
}