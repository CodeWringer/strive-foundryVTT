import { isDefined } from "../business/util/validation-utility.mjs";

export default class FoundryWrapper {
  mergeObject(defaultOptions, overrides) {
    if (isDefined(foundry) && isDefined(foundry.utils) && isDefined(foundry.utils.mergeObject)) { // Foundry 12
      return foundry.utils.mergeObject(defaultOptions, overrides);
    } else { // Foundry 11
      return mergeObject(defaultOptions, overrides);
    }
  }
  
  getDice(faces, number) {
    if (isDefined(foundry) && isDefined(foundry.dice) && isDefined(foundry.dice.terms) && isDefined(foundry.dice.terms.Die)) { // Foundry 12
      return new foundry.dice.terms.Die({ faces: faces, number: number })
    } else { // Foundry 11
      return new Die({ faces: faces, number: number })
    }
  }
}
