import { UuidUtil } from "./util/uuid-utility.mjs";
import { ValidationUtil } from "./util/validation-utility.mjs";

/**
 * Allows for multi-listener callback invocations. 
 */
export class Callbacks {
  /**
   * @type {Map<String, Function>}
   * @private
   */
  #handlers = new Map();

  /**
   * Adds the given `handler` as a listener for events. 
   * @param {Function} handler 
   * @returns {String | undefined} ID of the event listener. 
   * Can be passed to the `remove` method. Returns `undefined` 
   * in case of an invalid `handler`. 
   */
  add(handler) {
    if (!ValidationUtil.isDefined(handler)) return undefined;

    const id = new UuidUtil.createUuid();
    this.#handlers.set(id, handler);
    return id;
  }

  /**
   * Removes the handler with the given listener ID. 
   * @param {String} id Listener ID to remove. 
   * @returns {Boolean} `true`, if the ID could be removed. 
   */
  remove(id) {
    return this.#handlers.delete(id);
  }

  /**
   * Invokes all handlers, passing through any given arguments. 
   */
  invoke() {
    for (const handler of this.#handlers.values()) {
      handler(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]);
    }
  }
}
