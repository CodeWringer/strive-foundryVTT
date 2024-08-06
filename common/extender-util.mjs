import { isDefined } from "../business/util/validation-utility.mjs";

/**
 * Returns the extenders of the given type or an empty array, 
 * if none are defined. 
 * 
 * @param {Class} c The type for which to get the extenders. 
 * 
 * @returns {Array<Object>} The list of extenders. 
 */
export function getExtenders(c) {
  const extenders = game.strive.extenders.get(c);
  if (isDefined(extenders)) {
    return extenders
  } else {
    return [];
  }
}
