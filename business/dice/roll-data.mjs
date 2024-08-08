import FoundryWrapper from "../../common/foundry-wrapper.mjs";
import { Sum, SumComponent } from "../ruleset/summed-data.mjs";
import { isDefined, validateOrThrow } from "../util/validation-utility.mjs";
import { DICE_POOL_RESULT_TYPES } from "./dice-pool.mjs";
import { ROLL_DICE_MODIFIER_TYPES, RollDiceModifierType } from "./roll-dice-modifier-types.mjs";
import RollFormulaResolver from "./roll-formula-resolver.mjs";
import { RollInputData, RollResult, RollStepData } from "./roll-result.mjs";

/**
 * @property {Number} dieFaces The number of faces on a die. 
 * @property {Number} hitThreshold Sets the lower bound of faces that are considered 
 * hits. Any face turning up this number and numbers above, are considered hits. 
 * @property {Number} obFormula The obstacle formula to roll against. 
 * @property {Sum} diceComponents The number of dice to roll. 
 * @property {SumComponent} bonusDiceComponent
 * @property {Number} hitModifier Number of automatic hits/misses. 
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
   * @param {Number} args.hitModifier Number of automatic hits/misses. 
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
      "hitModifier", 
      "compensationPoints",
      "rollModifier",
    ]);

    this.dieFaces = args.dieFaces;
    this.hitThreshold = args.hitThreshold;
    this.obFormula = args.obFormula;
    this.diceComponents = args.diceComponents;
    this.bonusDiceComponent = args.bonusDiceComponent;
    this.hitModifier = args.hitModifier;
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
    const intermediateResults = await this._rollIntermediate();
    const results = this._finalize(intermediateResults);

    return new RollResult({
      inputData: new RollInputData({
        dice: this.diceComponents,
        bonusDice: this.bonusDiceComponent.value,
        compensationPoints: this.compensationPoints,
        hitModifier: this.hitModifier,
        rollModifier: this.rollModifier,
      }),
      intermediateResults: intermediateResults,
      results: results,
    })
  }

  /**
   * Rolls and returns the intermediate results, before compensation points 
   * or other such modifiers are applied. 
   * 
   * @returns {RollStepData}
   * 
   * @async
   * @private
   */
  async _rollIntermediate() {
    const finalDiceCount = this._getFinalDiceCount();
    const resolvedObstacle = await this._resolveOb(this.obFormula);

    let rolledFaces = [];
    // Only try to do any rolls, if there are dice to roll. 
    if (finalDiceCount > 0) {
      // Let FoundryVTT make the roll, then collect the faces and sort them in descending order. 
      const rolledDice = await new FoundryWrapper().getEvaluatedDice(this.dieFaces, finalDiceCount);

      rolledFaces = rolledDice
        .sort()
        .reverse();
    }
    
    // Analyze results. 
    const faceResults = this._evaluateFaces(rolledFaces, resolvedObstacle.ob);
    const degreeAndOutcome = this._evaluateDegreeAndOutcome(faceResults.hits.length, resolvedObstacle.ob);

    return new RollStepData({
      faces: rolledFaces,
      resolvedObstacle: resolvedObstacle,
      hits: faceResults.hits,
      misses: faceResults.misses,
      blankCount: faceResults.blankCount,
      degree: degreeAndOutcome.degree,
      outcomeType: degreeAndOutcome.outcomeType,
    });
  }

  /**
   * Applies modifier and compensation points and returns the new results. 
   * 
   * @param {RollStepData} intermediateResults 
   * 
   * @returns {RollStepData}
   * 
   * @private
   */
  _finalize(intermediateResults) {
    const modifiedFaces = intermediateResults.faces.concat([]); // Safe copy. 
    const resolvedObstacle = intermediateResults.resolvedObstacle;

    // Apply modifier. 
    let remainingModifier = this.hitModifier;
    if (this.hitModifier > 0) {
      for (let i = 0; i < modifiedFaces.length; i++) {
        if (remainingModifier === 0) break;

        const face = modifiedFaces[i];
        if (face < this.hitThreshold) {
          modifiedFaces[i] = this.hitThreshold;
          remainingModifier--;
        }
      }
    } else if (this.hitModifier < 0) {
      for (let i = modifiedFaces.length - 1; i >= 0; i--) {
        if (remainingModifier === 0) break;

        const face = modifiedFaces[i];
        if (face >= this.hitThreshold) {
          modifiedFaces[i] = 1;
          remainingModifier++;
        }
      }
    }

    // Apply compensation points. 
    let remainingCompensationPoints = this.compensationPoints;
    for (let i = 0; i < modifiedFaces.length; i++) {
      const face = modifiedFaces[i];

      if (remainingCompensationPoints < 1) break;

      const delta = this.hitThreshold - face;
      if (delta > remainingCompensationPoints) {
        modifiedFaces[i] = face + remainingCompensationPoints;
        break;
      } else if (delta > 0) {
        modifiedFaces[i] = face + delta;
        remainingCompensationPoints -= delta;
      }
    }

    // Analyze results. 
    const faceResults = this._evaluateFaces(modifiedFaces, resolvedObstacle.ob);
    const degreeAndOutcome = this._evaluateDegreeAndOutcome(faceResults.hits.length, resolvedObstacle.ob);

    return new RollStepData({
      faces: modifiedFaces,
      resolvedObstacle: resolvedObstacle,
      hits: faceResults.hits,
      misses: faceResults.misses,
      blankCount: faceResults.blankCount,
      degree: degreeAndOutcome.degree,
      outcomeType: degreeAndOutcome.outcomeType,
    });
  }

  /**
   * Returns the actual number of dice to roll. 
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

  /**
   * Returns the degree and outcome type, based on the given hits and obstacle. 
   * 
   * @param {Number} hitCount The number of hits that were scored. 
   * @param {Number} obstacle The resolved obstacle number. 
   * 
   * @returns {Object} An object with the fields: 
   * * `degree: Number`
   * * `outcomeType: DicePoolRollResultType`
   * 
   * @private
   */
  _evaluateDegreeAndOutcome(hitCount, obstacle) {
    let degree = 0;
    let outcomeType = DICE_POOL_RESULT_TYPES.NONE; // Ob 0 or invalid test. 

    if (obstacle > 0) {
      if (hitCount >= obstacle) { // Complete success
        outcomeType = DICE_POOL_RESULT_TYPES.SUCCESS;
        degree = hitCount - obstacle;
      } else if (hitCount > 0) { // Partial failure
        outcomeType = DICE_POOL_RESULT_TYPES.PARTIAL;
        degree = hitCount;
      } else {
        outcomeType = DICE_POOL_RESULT_TYPES.FAILURE;
      }
    }

    return {
      degree: degree,
      outcomeType: outcomeType,
    }
  }

  /**
   * Returns the results of the given faces, sorted in descending order. 
   * 
   * @param {Array<Number>} rolledFaces The list of actually rolled faces. 
   * @param {Number} obstacle The resolved obstacle number. 
   * 
   * @returns {Object} An object with the fields: 
   * * `hits: Array<Number>`
   * * `misses: Array<Number>`
   * * `blankCount: Number`
   * 
   * @private
   */
  _evaluateFaces(rolledFaces, obstacle) {
    const hits = [];
    const misses = [];
    const blankCount = Math.max(0, obstacle - rolledFaces.length);
    for (const rolledFace of rolledFaces) {
      if (rolledFace >= this.hitThreshold) {
        hits.push(rolledFace);
      } else {
        misses.push(rolledFace);
      }
    }
    return {
      hits: hits.sort().reverse(),
      misses: misses.sort().reverse(),
      blankCount: blankCount,
    }
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
