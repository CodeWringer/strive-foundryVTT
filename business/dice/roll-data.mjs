import { Sum, SumComponent } from "../ruleset/summed-data.mjs";
import { isDefined, validateOrThrow } from "../util/validation-utility.mjs";
import { DICE_POOL_RESULT_TYPES } from "./dice-pool.mjs";
import { ROLL_DICE_MODIFIER_TYPES, RollDiceModifierType } from "./roll-dice-modifier-types.mjs";
import RollFormulaResolver from "./roll-formula-resolver.mjs";
import { RollResult } from "./roll-result.mjs";

/**
 * @property {Number} dieFaces The number of faces on a die. 
 * @property {Number} hitThreshold Sets the lower bound of faces that are considered 
 * hits. Any face turning up this number and numbers above, are considered hits. 
 * @property {Number} obFormula The obstacle formula to roll against. 
 * @property {Sum} diceComponents The number of dice to roll. 
 * @property {SumComponent} bonusDiceComponent
 * @property {Number} modifier Number of automatic hits/misses. 
 * @property {Number} compensationPoints The number of miss-faces that can be turned 
 * to the next higher face, until they score a hit. 
 * @property {RollDiceModifierType} rollModifier The selected roll modifier. 
 */
export default class RollData {
  /**
   * @param {Object} args 
   * @param {Number} args.dieFaces The number of faces on a die. 
   * @param {Number} args.hitThreshold Sets the lower bound of faces that are considered 
   * hits. Any face turning up this number and numbers above, are considered hits. 
   * @param {String} args.obFormula The obstacle formula to roll against. 
   * @param {Sum} args.diceComponents The number of dice to roll. 
   * @param {SumComponent} args.bonusDiceComponent 
   * @param {Number} args.modifier Number of automatic hits/misses. 
   * @param {Number} args.compensationPoints The number of miss-faces that can be turned 
   * to the next higher face, until they score a hit. 
   * @param {RollDiceModifierType} args.rollModifier The selected roll modifier. 
   */
  constructor(args = {}) {
    validateOrThrow(args, [
      "dieFaces", 
      "hitThreshold", 
      "obFormula", 
      "diceComponents", 
      "bonusDiceComponent", 
      "modifier", 
      "compensationPoints",
      "rollModifier",
    ]);

    this.dieFaces = args.dieFaces;
    this.hitThreshold = args.hitThreshold;
    this.obFormula = args.obFormula;
    this.diceComponents = args.diceComponents;
    this.bonusDiceComponent = args.bonusDiceComponent;
    this.modifier = args.modifier;
    this.compensationPoints = args.compensationPoints;
    this.rollModifier = args.rollModifier;
  }

  /**
   * Rolls the dice and returns the result. 
   * 
   * Calling this method again will produce different results every time. 
   * 
   * @returns {RollResult}
   * 
   * @async
   */
  async roll() {
    const finalDiceCount = this._getFinalDiceCount();
    const resolvedObstacle = await this._resolveOb(this.obFormula);
    const obstacle = resolvedObstacle.ob;

    const blankCount = Math.max(0, resolvedObstacle.ob - finalDiceCount);
    const hits = [];
    const misses = [];
    // Only try to do any rolls, if there are dice to roll. 
    if (finalDiceCount > 0) {
      // Let FoundryVTT make the roll. 
      const rolledFaces = new Die({ faces: this.dieFaces, number: finalDiceCount })
        .evaluate().results
        .map(it => it.result);

      // Analyze results. 
      for (const rolledFace of rolledFaces) {
        if (rolledFace >= this.hitThreshold) {
          hits.push(rolledFace);
        } else {
          misses.push(rolledFace);
        }
      }
    }
    
    // Determine outcome type and degree of success/failure. 
    let degree = 0;
    let outcomeType = DICE_POOL_RESULT_TYPES.NONE; // Ob 0 or invalid test. 
    if (obstacle > 0) {
      if (hits.length >= obstacle) { // Complete success
        outcomeType = DICE_POOL_RESULT_TYPES.SUCCESS;
        degree = hits.length - obstacle;
      } else if (hits.length > 0) { // Partial failure
        outcomeType = DICE_POOL_RESULT_TYPES.PARTIAL;
        degree = hits.length;
      } else {
        outcomeType = DICE_POOL_RESULT_TYPES.FAILURE;
      }
    }

    // Include bonus dice, but only if there are any. 
    let totalDiceSum = new Sum(this.diceComponents.components);
    if (this.bonusDiceComponent.value > 0) {
      totalDiceSum.components.push(this.bonusDiceComponent);
    }

    return new RollResult({
      totalDice: totalDiceSum,
      totalRolledDice: finalDiceCount,
      resolvedObstacle: resolvedObstacle,
      hits: hits,
      misses: misses,
      blankCount: blankCount,
      degree: degree,
      outcomeType: outcomeType,
      rollModifier: this.rollModifier,
    });
  }

  /**
   * Returns the total number of dice to roll. 
   * 
   * @returns {Number} The total number of dice to roll. 
   * 
   * @private
   */
  _getFinalDiceCount() {
    let modifiedDiceCount = this.diceComponents.total;
    
    if (this.rollModifier.name === ROLL_DICE_MODIFIER_TYPES.HALF_ROUNDED_DOWN.name) {
      modifiedDiceCount = parseInt(Math.floor(modifiedDiceCount / 2.0));
    } else if (this.rollModifier.name === ROLL_DICE_MODIFIER_TYPES.HALF_ROUNDED_UP.name) {
      modifiedDiceCount = parseInt(Math.ceil(modifiedDiceCount / 2.0));
    }
    return modifiedDiceCount + this.bonusDiceComponent.value;
  }
  
  /**
   * Returns the resolved obstacle, evaluated from the given obstacle formula. 
   * 
   * @param {String} obFormula An obstacle formula. E.g. `"3D + 1"`
   * 
   * @returns {ResolvedObstacle} The resulting obstacle. 
   * 
   * @async
   */
  async _resolveOb(obFormula) {
    const rgxIsPlainNumber = new RegExp("^\\d+$");
    const isPlainNumber = isDefined(obFormula.match(rgxIsPlainNumber));

    let resolvedObFormula = obFormula;
    let obstacle = 0;
    if (isPlainNumber === true) {
      obstacle = parseInt(obFormula);
    } else {
      const evaluatedObstacle = await new RollFormulaResolver({
        formula: obFormula,
      }).evaluate();
      resolvedObFormula = await evaluatedObstacle.renderForDisplay()

      obstacle = parseInt(evaluatedObstacle.hitTotal) + 1;
    }

    return new ResolvedObstacle({
      obFormula: obFormula,
      resolvedObFormula: resolvedObFormula,
      ob: obstacle,
      isPlainNumber: isPlainNumber,
    });
  }

}

/**
 * Represents a resolved obstacle formula. 
 * 
 * @property {String} obFormula 
 * @property {String} resolvedObFormula 
 * @property {Number} ob 
 * @property {Boolean} isPlainNumber 
 */
export class ResolvedObstacle {
  /**
   * @param {Object} args 
   * @param {String} args.obFormula 
   * @param {String} args.resolvedObFormula 
   * @param {Number} args.ob 
   * @param {Boolean} args.isPlainNumber 
   */
  constructor(args = {}) {
    validateOrThrow(args, ["obFormula", "resolvedObFormula", "ob", "isPlainNumber"]);

    this.obFormula = args.obFormula;
    this.resolvedObFormula = args.resolvedObFormula;
    this.ob = args.ob;
    this.isPlainNumber = args.isPlainNumber;
  }
}
