import { isDefined } from "../business/util/validation-utility.mjs";

export default class FoundryWrapper {
  mergeObject(defaultOptions, overrides) {
    if (isDefined(foundry) && isDefined(foundry.utils) && isDefined(foundry.utils.mergeObject)) { // Foundry 12
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
    if (isDefined(foundry) && isDefined(foundry.dice) && isDefined(foundry.dice.terms) && isDefined(foundry.dice.terms.Die)) { // Foundry 12
      const rolledDice = await new foundry.dice.terms.Die({ faces: faces, number: number }).evaluate();

      return (rolledDice.values ?? rolledDice.results.map(it => it.result));
    } else { // Foundry 11
      const rolledDice = await new Die({ faces: faces, number: number }).evaluate();

      return rolledDice.results.map(it => it.result);
    }
  }
}
