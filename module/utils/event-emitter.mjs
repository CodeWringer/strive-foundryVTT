import { createUUID } from './uuid-utility.mjs';

/**
 * Internal listener representing object. 
 * @property {String} id ID of this listener. 
 *           Used for removing this listener. 
 * @property {Boolean} isOnce If true, will only ever be called once and then removed. 
 * @property {Function} callback The function to call when the associated event is emitted. 
 * @private
 */
class Listener {
  constructor(id, isOnce, callback) {
    this.id = id;
    this.isOnce = isOnce;
    this.callback = callback;
  }
}

/**
 * A simple event emitter system, based on an event bus system. 
 */
export class EventEmitter {
  /**
   * A list of events and their respective list of event ids. 
   * @type {Map<String, Array<Listener>>}
   * @private
   */
  _events = new Map();

  /**
   * Registers the given callback to be called whenever the given event is emitted. 
   * @param {String} event The event to register to. 
   * @param {Function} callback A callback to call when the given event is emitted. 
   * @returns {String} An id to refer to the registered callback to. 
   */
  on(event, callback) {
    const events = this._events.has(event) ? this._events.get(event) : new Map();
    
    const uuid = createUUID();
    events.set(uuid, new Listener(uuid, false, callback));
    return uuid;
  }
  
  /**
   * Registers the given callback to be called once, when the given event is emitted 
   * and then automatically un-registered. 
   * @param {String} event The event to register to. 
   * @param {Function} callback A callback to call when the given event is emitted. 
   * @returns {String} An id to refer to the registered callback to. 
   */
  once(event, callback) {
    const events = this._events.has(event) ? this._events.get(event) : new Map();
    
    const uuid = createUUID();
    events.set(uuid, new Listener(uuid, true, callback));
    return uuid;
  }

  /**
   * Un-registers the given callback from the given event. 
   * @param {String} callbackId 
   */
  off(callbackId) {
    for (const [event, listeners] of this._events) {
      for (let i = 0; i < listeners.length; i++) {
        if (listeners[i].id === callbackId) {
          listeners.splice(i, 1);
          return;
        }
      }
    }
  }

  /**
   * Un-registers all callbacks from the given event. 
   * @param {String} event The event to un-register all callbacks from. 
   */
  allOff(event) {
    this._events.set(event, []);
  }

  /**
   * Emits the given event, with optional arguments. 
   * @param {String} event The event to emit. 
   * @param {Any} args Optional, additional arguments to pass to the callback. 
   */
  emit(event) {
    const listeners = this._events.get(event);
    if (typeof(listeners) === undefined || typeof(listeners) === null) return;

    const callbacks = listeners.values();
    for (const callback of callbacks) {
      callback(arguments);
    }
  }
}