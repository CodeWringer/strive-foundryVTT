import { common } from "../../../../common/_module.mjs";

/**
 * Represents the total outcome of a dice pool roll. 
 * 
 * @property {String} name Internal name. 
 * @property {String} localizableName Localization key. 
 */
export class DicePoolRollResultType {
  constructor(args = {}) {
    common.util.validation.validateOrThrow(args, ["name", "localizableName"]);
    
    this.name = args.name;
    this.localizableName = args.localizableName;
  }
}

/**
 * Represents all defined dice pool roll outcome types. 
 * 
 * @property {DicePoolRollResultType} none There is no actual outcome. 
 * * This is the case for Ob 0 tests, which commonly serve as a means to provide the Ob for an opposed test. 
 * @property {DicePoolRollResultType} success The test was a complete success. 
 * @property {DicePoolRollResultType} failure The test was a failure. 
 * @property {DicePoolRollResultType} absolute_failure The test was a complete failure. 
 * 
 * @constant
 */
export const DICE_POOL_RESULT_TYPES = {
  none: new DicePoolRollResultType({
    name: "NONE",
    localizableName: "system.general.none.label",
  }),
  success: new DicePoolRollResultType({
    name: "SUCCESS",
    localizableName: "system.roll.success",
  }),
  failure: new DicePoolRollResultType({
    name: "FAILURE",
    localizableName: "system.roll.failure",
  }),
  absolute_failure: new DicePoolRollResultType({
    name: "ABSOLUTE_FAILURE",
    localizableName: "system.roll.absoluteFailure",
  }),
}
