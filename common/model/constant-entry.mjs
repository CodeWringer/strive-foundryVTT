import { ValidationUtil } from "../util/validation-utility.mjs";

/**
 * Abstract base class for the entries of constants. 
 * 
 * @abstract Inheritors needn't override anything.
 * 
 * @property {String} name Internal name. 
 * @property {String} localizableName Localization key. 
 * @property {String} icon
 */
export default class ConstantEntry {
  /**
   * @param {Object} args 
   * @param {String} args.name Internal name. 
   * @param {String} args.localizableName Localization key. 
   * @param {String} args.icon 
   */
  constructor(args = {}) {
    ValidationUtil.validateOrThrow(args, ["name"]);

    this.name = args.name;
    this.localizableName = args.localizableName;
    this.icon = args.icon;
  }
}
