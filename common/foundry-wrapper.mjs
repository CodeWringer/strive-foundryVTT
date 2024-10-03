import { ValidationUtil } from "../business/util/validation-utility.mjs";

export default class FoundryWrapper {
  mergeObject(defaultOptions, overrides) {
    if (ValidationUtil.isDefined(foundry) && ValidationUtil.isDefined(foundry.utils) && ValidationUtil.isDefined(foundry.utils.mergeObject)) { // Foundry 12
      return foundry.utils.mergeObject(defaultOptions, overrides);
    } else { // Foundry 11
      return mergeObject(defaultOptions, overrides);
    }
  }
  
  /**
   * Uses Foundry's dice roller to roll `number` of dice with `faces` faces and returns 
   * the rolled face results. 
   * 
   * @param {Number} faces The number of faces on a die. 
   * @param {Number} number The number of dice to roll. 
   * 
   * @returns {Array<Number>} The rolled faces. 
   * 
   * @async
   */
  async getEvaluatedDice(faces, number) {
    if (ValidationUtil.isDefined(foundry) && ValidationUtil.isDefined(foundry.dice) && ValidationUtil.isDefined(foundry.dice.terms) && ValidationUtil.isDefined(foundry.dice.terms.Die)) { // Foundry 12
      const rolledDice = await new foundry.dice.terms.Die({ faces: faces, number: number }).evaluate();

      return (rolledDice.values ?? rolledDice.results.map(it => it.result));
    } else { // Foundry 11
      const rolledDice = await new Die({ faces: faces, number: number }).evaluate();

      return rolledDice.results.map(it => it.result);
    }
  }
}
