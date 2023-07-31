import { SumComponent } from "../ruleset/summed-data.mjs";
import { ROLL_DICE_MODIFIER_TYPES } from "./roll-dice-modifier-types.mjs";

/**
 * Represents a dice pool. 
 * 
 * @property {Sum} dice The dice composition for use in the roll. 
 * @property {Sum} bonus The bonus dice composition for use in the roll. 
 * @property {Number} obstacle The obstacle to roll against. 
 * * Default `0`
 * @property {RollDiceModifierType | undefined} modifier A dice number modifier. 
 * * Default `ROLL_DICE_MODIFIER_TYPES.NONE`
*/
export default class DicePool {
  /**
   * @param {Object} args The arguments object. 
   * @param {Array<SumComponent> | undefined} args.dice The dice composition for use in the roll. 
   * @param {Array<SumComponent> | undefined} args.bonus The bonus dice composition for use in the roll. 
   * @param {Number} args.obstacle The obstacle to roll against. 
   * * Default `0`
   * @param {RollDiceModifierType | undefined} args.modifier A dice number modifier. 
   * * Default `ROLL_DICE_MODIFIER_TYPES.NONE`
   */
  constructor(args = {}) {
    this.dice = args.dice ?? [];
    this.bonus = args.bonus ?? [];
    this.obstacle = args.obstacle ?? 0;
    this.modifier = args.modifier ?? ROLL_DICE_MODIFIER_TYPES.NONE;
  }

  /**
   * Rolls the current configuration of dice and returns the result. 
   * 
   * Calling this method again will produce different results every time. 
   * 
   * @returns {DicePoolRollResult}
   */
  roll() {

  }
}

/**
 * Represents the result of a dice pool roll. 
 * 
 * @property {Sum} dice The dice and bonus dice that were passed, and their sum. 
 */
export class DicePoolRollResult {

}
