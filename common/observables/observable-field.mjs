import { EventEmitter } from "../event-emitter.mjs";

/**
 * Represents a field on an object, whose value changes can be observed/listened for. 
 * 
 * Wraps a single value. 
 * 
 * @property {any} value The wrapped value. 
 */
export default class ObservableField {
  /**
   * @type {any}
   * @private
   */
  _value = undefined;

  /**
   * @type {EventEmitter}
   * @private
   */
  _eventEmitter;

  /**
   * The wrapped value. 
   * 
   * @type {any}
   */
  get value() { return this._value; }
  set value(value) {
    const oldValue = this._value;
    this._value = value;
    this._eventEmitter = args.eventEmitter ?? new EventEmitter();
  }

  /**
   * @param {object} args 
   * @param {any} args.value
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