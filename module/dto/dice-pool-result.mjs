/**
 * Represents the result of a dice pool roll. 
 * @property {Number} numberOfDice Optional. The number of dice that were rolled. Default 0. 
 * @property {Number} obstacle Optional. The obstacle that was rolled against. Default 0. 
 * @property {Number} degree Optional. The degree of success. Default 0. 
 * @property {Array<Number>} positives Optional. An array of positive die results. Default []. 
 * @property {Array<Number>} negatives Optional. An array of negative die results. Default []. 
 * @property {Boolean} isSuccess Optional. If true, the roll result was a complete success. Default false. 
 */
export default class DicePoolResult {
  /**
   * @param {Number} numberOfDice Optional. The number of dice that were rolled. Default 0. 
   * @param {Number} obstacle Optional. The obstacle that was rolled against. Default 0. 
   * @param {Number} degree Optional. The degree of success. Default 0. 
   * @param {Array<Number>} positives Optional. An array of positive die results. Default []. 
   * @param {Array<Number>} negatives Optional. An array of negative die results. Default []. 
   * @param {Boolean} isSuccess Optional. If true, the roll result was a complete success. Default false. 
   */
  constructor(args = {}) {
    this.type = "DicePoolResult";

    this.numberOfDice = args.numberOfDice ?? 0;
    this.obstacle = args.obstacle ?? 0;
    this.positives = args.positives ?? [];
    this.negatives = args.negatives ?? [];
    this.isSuccess = args.isSuccess ?? false;
    this.degree = args.degree ?? 0;
  }
}