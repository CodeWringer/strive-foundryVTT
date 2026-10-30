import { ValidationUtil } from "../../common/util/validation-utility.mjs";

/**
 * Used to evaluate element visibilities based on a function's result. 
 */
export default class VisibilityRule {
  /**
   * @param {Object} args 
   * @param {String} args.cssClass 
   * @param {Function<Boolean>} args.shouldBeHidden Function that is invoked to determine whether the 
   * element(s) identified by the given `cssClass` should be hidden. MUST return a boolean value! 
   */
  constructor(args = {}) {
    ValidationUtil.validateOrThrow(args, ["cssClass", "shouldBeHidden"]);

    this.cssClass = args.cssClass;
    this.shouldBeHidden = args.shouldBeHidden;
  }
}
