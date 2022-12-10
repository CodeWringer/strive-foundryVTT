import { DiceOutcomeTypes } from "./dice-outcome-types.mjs";

/**
 * Represents the result of a dice pool roll. 
 * @property {Number} numberOfDice Optional. The number of dice that were rolled. Default 0. 
 * @property {Number} obstacle Optional. The obstacle that was rolled against. Default 0. 
 * @property {Number} degree Optional. The degree of success. Default 0. 
 * @property {Array<Number>} positives Optional. An array of positive die results. Default []. 
 * @property {Array<Number>} negatives Optional. An array of negative die results. Default []. 
 * @property {DiceOutcomeTypes} outcomeType Optional. Indicates what type of outcome is represented. 
 * * Default `DiceOutcomeTypes.NONE`. 
 */
export default class DicePoolResult {
  /**
   * @param {Number} numberOfDice Optional. The number of dice that were rolled. Default 0. 
   * @param {Number} obstacle Optional. The obstacle that was rolled against. Default 0. 
   * @param {Number} degree Optional. The degree of success. Default 0. 
   * @param {Array<Number>} positives Optional. An array of positive die results. Default []. 
   * @param {Array<Number>} negatives Optional. An array of negative die results. Default []. 
   * @property {DiceOutcomeTypes} outcomeType Optional. Indicates what type of outcome is represented. 
   * * Default `DiceOutcomeTypes.NONE`. 
   */
  constructor(args = {}) {
    this.type = "DicePoolResult";

    this.numberOfDice = args.numberOfDice ?? 0;
    this.obstacle = args.obstacle ?? 0;
    this.positives = args.positives ?? [];
    this.negatives = args.negatives ?? [];
    this.outcomeType = args.outcomeType ?? DiceOutcomeTypes.NONE;
    this.degree = args.degree ?? 0;
  }
}