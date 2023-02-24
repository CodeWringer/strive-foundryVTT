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
   * Event key for the "onChange" event. 
   * 
   * @static
   * @type {String}
   */
  static EVENT_ON_CHANGE = "fieldOnChange";

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
    this._eventEmitter.emit(ObservableField.EVENT_ON_CHANGE, oldValue, value);
  }

  /**
   * @param {object} args 
   * @param {any} args.value An initial value to set. 
   */
  constructor(args = {}) {
    this._value = args.value;
    this._eventEmitter = new EventEmitter();
  }

  /**
   * Registers an event listener that is invoked whenever the value is changed. 
   * 
   * @param {Function} callback 
   * * Receives the following arguments:
   * * * `oldValue: any`
   * * * `newValue: any`
   * 
   * @returns {String} An id to refer to the registered callback to. 
   */
  onChange(callback) {
    return this._eventEmitter.on(ObservableField.EVENT_ON_CHANGE, callback);
  }

  /**
   * Un-registers an event listener with the given id. 
   * 
   * @param {String} callbackId 
   */
  offChange(callbackId) {
    this._eventEmitter.off(callbackId);
  }

  /**
   * Disposes of any working data. 
   */
  dispose() {
    this._eventEmitter.allOff();
  }
}