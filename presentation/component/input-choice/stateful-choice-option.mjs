import { ValidationUtil } from "../../../business/util/validation-utility.mjs";
import ChoiceOption from "./choice-option.mjs";

/**
 * Represents a choice option for a radio-button or check-box. 
 * 
 * Is stateful in the sense that content may be chosen based on whether 
 * the underlying option is active or inactive. 
 * 
 * @property {String} value The actual value. 
 * @property {String} activeHtml The raw HTML used to display the value if active.
 * @property {String} inactiveHtml The raw HTML used to display the value if inactive.
 * @property {Boolean} isActive Is `true`, if this option is active. 
 * * Read-only
 * @property {String | undefined} tooltip A tool tip to display on cursor hover over 
 * the choice. 
 */
export default class StatefulChoiceOption extends ChoiceOption {
  /**
   * @param {Object} args
   * @param {String} args.value The actual value. 
   * @param {String} args.activeHtml The raw HTML used to display the 
   * value if active.
   * @param {String | undefined} args.inactiveHtml The raw HTML used to display the 
   * value if inactive.
   * * If left `undefined`, will defer to the value of `activeHtml`. 
   * @param {String | undefined} args.tooltip A tool tip to display on cursor hover over 
   * the choice. 
   * @param {Boolean | undefined} args.isActive If `true`, this option is active. 
   * * default `false` 
   */
  constructor(args = {}) {
    super(args);

    ValidationUtil.validateOrThrow(args, ["value", "activeHtml"])

    this.activeHtml = args.activeHtml;
    this.tooltip = args.tooltip;
    this.inactiveHtml = args.inactiveHtml ?? args.activeHtml;
    this.isActive = args.isActive ?? false;
  }
}