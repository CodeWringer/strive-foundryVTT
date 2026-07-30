import { ArrayUtil } from "../../../common/util/array-utility.mjs";
import { ValidationUtil } from "../../../common/util/validation-utility.mjs";
import { MODIFIER_KEY_CODES } from "./key-codes.mjs";

/**
 * Provides means to query ***global*** key events. 
 * 
 * DO NOT use this for key events that are only supposed to be invoked when 
 * a certain element has focus!
 * 
 * @constant
 */
export const KEYBOARD = {
  /**
   * Caches listeners. 
   * 
   * @type {Map<Number, Object>}
   * @private
   */
  _keyDownListeners: null,

  /**
   * Caches listeners. 
   * 
   * @type {Map<Number, Object>}
   * @private
   */
  _keyUpListeners: null,

  /**
   * ID handed out to listeners. 
   * @type {Number}
   * @private
   */
  _listenerId: 0,

  /**
   * Initializes working data. 
   * 
   * To be called in the system's set up. 
   */
  init: function() {
    KEYBOARD._keyDownListeners = new Map();
    KEYBOARD._keyUpListeners = new Map();
    
    $("body")
      .on("keydown", KEYBOARD, KEYBOARD._handleGlobalKeyDown)
      .on("keyup", KEYBOARD, KEYBOARD._handleGlobalKeyUp);
  },

  /**
   * Disposes of working data for clean-up. 
   */
  dispose: function() {
    $("body")
      .off("keydown", KEYBOARD._handleGlobalKeyDown)
      .off("keyup", KEYBOARD._handleGlobalKeyUp);

    KEYBOARD._keyDownListeners = null;
    KEYBOARD._keyUpListeners = null;
  },

  /**
   * Binds the given handler to the **global** keydown event. 
   * 
   * @param {Object} args
   * @param {Array<Number> | undefined} args.keyCodes Key codes on which to invoke the `handler`. 
   * * see the `KEY_CODES` constant. 
   * @param {Number | undefined} args.modifier The modifier required to invoke the `handler`. 
   * * see the `MODIFIER_KEY_CODES` constant. 
   * @param {Function} args.handler The callback function to bind. Gets invoked whenever any key of the given 
   * `keyCodes` is pressed down. 
   * * Receives `data` as sole argument. 
   * @param {Any | undefined} args.data Optional data to pass through to the `handler`. 
   * @returns {Number} Listener id. Can be passed to `offKeyDown` to deactivate the listener. 
   */
  onKeyDown: function(args = {}) {
    const listenerId = KEYBOARD._listenerId;
    KEYBOARD._keyDownListeners.set(listenerId, {
      keyCodes: args.keyCodes,
      modifier: args.modifier,
      handler: args.handler,
      data: args.data,
    });
    return KEYBOARD._listenerId++;
  },

  /**
   * Removes the listener with the given ID from the **global** keydown event. 
   * @param {Number} id Listener ID to remove. 
   */
  offKeyDown: function(id) {
    if (KEYBOARD._keyDownListeners.has(id)) {
      KEYBOARD._keyDownListeners.delete(id);
    }
  },

  /**
   * Binds the given handler to the **global** keyup event. 
   * 
   * @param {Object} args
   * @param {Number | undefined} args.keyCodes Key codes on which to invoke the `handler`. 
   * * see the `KEY_CODES` constant. 
   * @param {Number | undefined} args.modifier The modifier required to invoke the `handler`. 
   * * see the `MODIFIER_KEY_CODES` constant. 
   * @param {Function} args.handler The callback function to bind. Gets invoked whenever any key of the given 
   * `keyCodes` is released. 
   * * Receives `data` as sole argument. 
   * @param {Any | undefined} args.data Optional data to pass through to the `handler`. 
   * @returns {Number} Listener id. Can be passed to `offKeyUp` to deactivate the listener. 
   */
  onKeyUp: function(args = {}) {
    const listenerId = KEYBOARD._listenerId;
    KEYBOARD._keyUpListeners.set(listenerId, {
      keyCodes: args.keyCodes,
      modifier: args.modifier,
      handler: args.handler,
      data: args.data,
    });
    return KEYBOARD._listenerId++;
  },

  /**
   * Removes the listener with the given ID from the **global** keyup event. 
   * @param {Number} id Listener ID to remove. 
   */
  offKeyUp: function(id) {
    if (KEYBOARD._keyUpListeners.has(id)) {
      KEYBOARD._keyUpListeners.delete(id);
    }
  },

  /**
   * Handles invoking listeners of the global key down event. 
   * 
   * @param {Object} event 
   * 
   * @private
   */
  _handleGlobalKeyDown: function(event) {
    const keyCode = event.which;
    for (const [key, value] of KEYBOARD._keyDownListeners) {
      if (ValidationUtil.isDefined(value.modifier)) {
        if (value.modifier === MODIFIER_KEY_CODES.ALT && !event.altKey) continue;
        if (value.modifier === MODIFIER_KEY_CODES.CTRL && !event.ctrlKey) continue;
      }
      if (ValidationUtil.isDefined(value.keyCodes)) {
        if (!ArrayUtil.arrayContains(value.keyCodes, keyCode)) continue;
      }
      value.handler(value.data);
    }
  },

  /**
   * Handles invoking listeners of the global key up event. 
   * 
   * @param {Object} event 
   * 
   * @private
   */
  _handleGlobalKeyUp: function(event) {
    const keyCode = event.which;
    for (const [key, value] of KEYBOARD._keyUpListeners) {
      if (ValidationUtil.isDefined(value.modifier)) {
        if (value.modifier === MODIFIER_KEY_CODES.ALT && !event.altKey) continue;
        if (value.modifier === MODIFIER_KEY_CODES.CTRL && !event.ctrlKey) continue;
      }
      if (ValidationUtil.isDefined(value.keyCodes)) {
        if (!ArrayUtil.arrayContains(value.keyCodes, keyCode)) continue;
      }
      value.handler(value.data);
    }
  },
}
