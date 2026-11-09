import { ValidationUtil } from "../../common/util/validation-utility.mjs";

/**
 * Used to evaluate element visibilities based on a function's result. 
 */
export default class VisibilityRule {
  /**
   * @param {Object} args 
   * @param {String} args.selector Selects the element(s) to be affected. 
   * E.g. `"> .my-class"`
   * @param {Function<Boolean>} args.shouldBeHidden Function that is invoked to determine whether the 
   * element(s) identified by the given `selector` should be hidden. MUST return a boolean value! 
   * @param {String | undefined} args.hoverTriggerElementSelector Selects the element(s) that enable 
   * visibility on hover. 
   * E.g. `"> .my-class"`
   */
  constructor(args = {}) {
    ValidationUtil.validateOrThrow(args, ["selector", "shouldBeHidden"]);

    this.selector = args.selector;
    this.shouldBeHidden = args.shouldBeHidden;
    this.hoverTriggerElementSelector = args.hoverTriggerElementSelector;
  }
}
