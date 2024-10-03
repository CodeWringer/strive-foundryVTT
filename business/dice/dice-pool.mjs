import { ConstantsUtil } from "../util/constants-utility.mjs";
import { ValidationUtil } from "../util/validation-utility.mjs";

/**
 * Represents the total outcome of a dice pool roll. 
 * 
 * @property {String} name Internal name. 
 * @property {String} localizableName Localization key. 
 */
export class DicePoolRollResultType {
  constructor(args = {}) {
    ValidationUtil.validateOrThrow(args, ["name", "localizableName"]);
    
    this.name = args.name;
    this.localizableName = args.localizableName;
  }
}

/**
 * Represents all defined dice pool roll outcome types. 
 * 
 * @property {DicePoolRollResultType} NONE There is no actual outcome. 
 * * This is the case for Ob 0 tests, which commonly serve as a means to provide the Ob for an opposed test. 
 * @property {DicePoolRollResultType} SUCCESS The test was a complete success. 
 * @property {DicePoolRollResultType} FAILURE The test was a complete failure. 
 * @property {DicePoolRollResultType} PARTIAL The test was a partial failure. Not enough for a success, but not as bad as a complete failure. 
 * 
 * @constant
 */
export const DICE_POOL_RESULT_TYPES = {
  NONE: new DicePoolRollResultType({
    name: "none",
    localizableName: "system.general.none.label",
  }),
  SUCCESS: new DicePoolRollResultType({
    name: "success",
    localizableName: "system.roll.success.label",
  }),
  FAILURE: new DicePoolRollResultType({
    name: "failure",
    localizableName: "system.roll.failure.label",
  }),
  PARTIAL: new DicePoolRollResultType({
    name: "partial",
    localizableName: "system.roll.partial.label",
  }),
}
ConstantsUtil.enrichConstant(DICE_POOL_RESULT_TYPES);
