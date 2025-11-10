import { ValidationUtil } from "../../../../../../business/util/validation-utility.mjs";

/**
 * @property {String} id Internal id of this grit point. 
 * @property {Number} value The represented grit point value. 
 * @property {Boolean} active If `true`, then this grit point is 
 * currently active / available to be spent. 
 */
export default class GritPoint {
  /**
   * @param {Object} args 
   * @param {String} args.id Internal id of this grit point. 
   * @param {Number} args.value The represented grit point value. 
   * @param {Boolean | undefined} args.active If `true`, then this grit point is 
   * currently active / available to be spent. 
   * * default `false`
   */
  constructor(args = {}) {
    ValidationUtil.validateOrThrow(args, ["id", "value"]);

    this.id = args.id;
    this.value = args.value;
    this.active = args.active ?? false;
  }
}
