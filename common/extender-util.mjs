import { ValidationUtil } from "../business/util/validation-utility.mjs";

/**
 * Provides global functions to register and fetch class extenders. 
 * 
 * @constant
 */
export const ExtenderUtil = {
  /**
   * Returns the extenders of the given type or an empty array, 
   * if none are defined. 
   * 
   * @param {Class} clazz The type for which to get the extenders. 
   * 
   * @returns {Array<Object>} The list of extenders. 
   */
  getExtenders: function(clazz) {
    const extenders = game.strive.extenders.get(clazz);
    if (ValidationUtil.isDefined(extenders)) {
      return extenders
    } else {
      return [];
    }
  },

  /**
   * Registers an extender with the strive game system. 
   * 
   * @param {Class} clazz The class definition of the type to extend. 
   * E. g. `game.strive.classDef.viewModel.actor.ActorSheetViewModel` 
   * @param {Object} extender An extender instance that will be used 
   * to extend instances of `clazz`. This **must** be an object which 
   * exposes a `extend` method, which takes the following arguments:
   * * `obj: Object` - an instance of the `clazz` to extend. 
   */
  addExtender: function(clazz, extender) {
    const extenderList = game.strive.extenders.get(clazz) ?? [];
    game.strive.extenders.set(clazz, extenderList.concat([extender]));
  }
}
