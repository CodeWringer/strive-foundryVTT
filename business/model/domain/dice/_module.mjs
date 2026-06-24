import { common } from "../../../../common/_module.mjs";
import { DICE_CONSTANTS } from "./dice-constants.mjs";
import { DICE_POOL_RESULT_TYPES, DicePoolRollResultType } from "./dice-pool.mjs";
import RollData, { ResolvedObstacle } from "./roll-data.mjs";
import { ROLL_DICE_MODIFIER_TYPES, RollDiceModifierType } from "./roll-dice-modifier-types.mjs";
import RollFormulaResolver, { D6Group, EvaluatedRollFormula } from "./roll-formula-resolver.mjs";
import RollQueryData from "./roll-query-data.mjs";
import { RollInputData, RollResult, RollStepData } from "./roll-result.mjs";
import { RollSchema } from "./roll-schema.mjs";

export {
  DICE_CONSTANTS,
  DicePoolRollResultType,
  DICE_POOL_RESULT_TYPES,
  RollData,
  ResolvedObstacle,
  RollDiceModifierType,
  ROLL_DICE_MODIFIER_TYPES,
  RollFormulaResolver,
  D6Group,
  EvaluatedRollFormula,
  RollQueryData,
  RollInputData,
  RollStepData,
  RollResult,
  RollSchema,
};

/**
 * Wraps the `business.model.domain.dice` module.
 */
export const dice = {
  DICE_CONSTANTS: DICE_CONSTANTS,
  DicePoolRollResultType: DicePoolRollResultType,
  DICE_POOL_RESULT_TYPES: DICE_POOL_RESULT_TYPES,
  RollData: RollData,
  ResolvedObstacle: ResolvedObstacle,
  RollDiceModifierType: RollDiceModifierType,
  ROLL_DICE_MODIFIER_TYPES: ROLL_DICE_MODIFIER_TYPES,
  RollFormulaResolver: RollFormulaResolver,
  D6Group: D6Group,
  EvaluatedRollFormula: EvaluatedRollFormula,
  RollQueryData: RollQueryData,
  RollInputData: RollInputData,
  RollStepData: RollStepData,
  RollResult: RollResult,
  RollSchema: RollSchema,
  init: () => {
    common.util.constants.enrichConstant(ROLL_DICE_MODIFIER_TYPES);
    common.util.constants.enrichConstant(DICE_POOL_RESULT_TYPES);
  },
};
