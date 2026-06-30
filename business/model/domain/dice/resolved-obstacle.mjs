import { common } from "../../../../common/_module.mjs";

/**
 * Represents a resolved obstacle formula. 
 * 
 * @property {String} obFormula 
 * @property {String} resolvedObFormula 
 * @property {Number} ob 
 * @property {Boolean} isPlainNumber 
 */
export default class ResolvedObstacle {
  /**
   * @param {Object} args 
   * @param {String} args.obFormula 
   * @param {String} args.resolvedObFormula 
   * @param {Number} args.ob 
   * @param {Boolean} args.isPlainNumber 
   */
  constructor(args = {}) {
    common.util.validation.validateOrThrow(args, ["obFormula", "resolvedObFormula", "ob", "isPlainNumber"]);

    this.obFormula = args.obFormula;
    this.resolvedObFormula = args.resolvedObFormula;
    this.ob = args.ob;
    this.isPlainNumber = args.isPlainNumber;
  }
}
