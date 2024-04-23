/**
 * Provides means to query global key events. 
 * 
 * @constant
 */
export const KEYBOARD = {
  /**
   * Maps key codes to keydown listeners. 
   * 
   * @type {Map<KEY_CODE, Array<Object>>}
   * @private
   */
  _keyDownListeners: undefined,

  /**
   * Maps key codes to keyup listeners. 
   * 
   * @type {Map<KEY_CODE, Array<Object>>}
   * @private
   */
  _keyUpListeners: undefined,

  /**
   * Initializes working data. 
   * 
   * To be called in the system's set up. 
   */
  init: function() {
    $("body")
      .on("keydown", this, this._handleGlobalKeyDown)
      .on("keyup", this, this._handleGlobalKeyUp);

    this._keyDownListeners = new Map();
    this._keyUpListeners = new Map();
  },

  /**
   * Disposes of working data for clean-up. 
   */
  dispose: function() {
    $("body")
      .off("keydown", this._handleGlobalKeyDown)
      .off("keyup", this._handleGlobalKeyUp);

    this._keyDownListeners = undefined;
    this._keyUpListeners = undefined;
  },

  /**
   * Binds the given handler to the **global** keydown event. 
   * 
   * @param {Number} keyCode The key code on which to invoke the `handler`. 
   * * see the `KEY_CODES` constant. 
   * @param {Function} handler The callback function to bind. Gets invoked whenever the key with the given 
   * `keyCode` is pressed down. 
   * * Receives `data` as sole argument. 
   * @param {Any | undefined} data Optional data to pass through to the `handler`. 
   */
  onKeyDown: function(keyCode, handler, data) {
    let arr = [];

    if (this._keyDownListeners.has(keyCode)) {
      arr = this._keyDownListeners.get(keyCode);
    }

    arr.push({
      handler: handler,
      data: data,
    });

    this._keyDownListeners.set(keyCode, arr);
  },

  /**
   * Removes the given handler from the **global** keydown event. 
   * @param {Number} keyCode The key code from which to remove the `handler`. 
   * * see the `KEY_CODES` constant. 
   * @param {Function} handler The callback function to remove. 
   */
  offKeyDown: function(keyCode, handler) {
    if (this._keyDownListeners.has(keyCode)) {
      const arr = this._keyDownListeners.get(keyCode) ?? [];

      // Find index of the element to remove. 
      let index = 0
      for (; index < arr.length; index++) {
        if (arr[index].handler == handler) {
          break;
        }
      }

      // Remove the element. 
      if (index > -1) {
        arr.splice(index, 1);
      }

      this._keyDownListeners.set(keyCode, arr);
    }
  },

  /**
   * Binds the given handler to the **global** keyup event. 
   * 
   * @param {Number} keyCode The key code on which to invoke the `handler`. 
   * * see the `KEY_CODES` constant. 
   * @param {Function} handler The callback function to bind. Gets invoked whenever the key with the given 
   * `keyCode` is released. 
   * * Receives `data` as sole argument. 
   * @param {Any | undefined} data Optional data to pass through to the `handler`. 
   */
  onKeyUp: function(keyCode, handler, data) {
    let arr = [];

    if (this._keyUpListeners.has(keyCode)) {
      arr = this._keyUpListeners.get(keyCode);
    }

    arr.push({
      handler: handler,
      data: data,
    });

    this._keyUpListeners.set(keyCode, arr);
  },

  /**
   * Removes the given handler from the **global** keyup event. 
   * @param {Number} keyCode The key code from which to remove the `handler`. 
   * * see the `KEY_CODES` constant. 
   * @param {Function} handler The callback function to remove. 
   */
  offKeyUp: function(keyCode, handler) {
    if (this._keyUpListeners.has(keyCode)) {
      const arr = this._keyUpListeners.get(keyCode) ?? [];

      // Find index of the element to remove. 
      let index = 0
      for (; index < arr.length; index++) {
        if (arr[index].handler == handler) {
          break;
        }
      }

      // Remove the element. 
      if (index > -1) {
        arr.splice(index, 1);
      }

      this._keyUpListeners.set(keyCode, arr);
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
    const listeners = (event.data._keyDownListeners.get(event.which) ?? []);
    listeners.forEach(listener => {
      listener.handler(listener.data);
    });
  },

  /**
   * Handles invoking listeners of the global key up event. 
   * 
   * @param {Object} event 
   * 
   * @private
   */
  _handleGlobalKeyUp: function(event) {
    const listeners = (event.data._keyUpListeners.get(event.which) ?? []);
    listeners.forEach(listener => {
      listener.handler(listener.data);
    });
  },
}
