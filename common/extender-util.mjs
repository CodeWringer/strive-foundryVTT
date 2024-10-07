import { ValidationUtil } from "../business/util/validation-utility.mjs";

/**
 * @constant
 */
export const ExtenderUtil = {
  /**
   * Returns the extenders of the given type or an empty array, 
   * if none are defined. 
   * 
   * @param {Class} c The type for which to get the extenders. 
   * 
   * @returns {Array<Object>} The list of extenders. 
   */
  getExtenders: function(c) {
    const extenders = game.strive.extenders.get(c);
    if (ValidationUtil.isDefined(extenders)) {
      return extenders
    } else {
      return [];
    }
  },
}
