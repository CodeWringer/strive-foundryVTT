import { validateOrThrow } from "../util/validation-utility.mjs";

/**
 * Represents a modifier to a document property. 
 * 
 * This could for example represent an attribute or skill level 
 * modifier incurred by an injury, illness, mutation, scar and so on. 
 * 
 * @property {String} propertyPath Path leading to the property to modify. 
   *  * Array-accessing via brackets is supported. Property-accessing via brackets is *not* supported. 
   * * E.g.: `"system.attributes[0].level" `
   * * E.g.: `"system.attributes[4]" `
   * * E.g.: `"system.attributes" `
 * @property {String} formula A formula supporting simple arithmetic operations or dice rolls. 
 * * E.g.: `-1D3 + 1`
 */
export default class Modifier {
  constructor(args = {}) {
    validateOrThrow(args, ["propertyPath", "formula"]);

    this.propertyPath = args.propertyPath;
    this.formula = args.formula;
  }
}