import { VISIBILITY_MODES, VisibilityMode } from "../../presentation/chat/visibility-modes.mjs";
import { ValidationUtil } from "../util/validation-utility.mjs";
import { ROLL_DICE_MODIFIER_TYPES, RollDiceModifierType } from "./roll-dice-modifier-types.mjs";

/**
 * Holds the data queried from the user via `RollSchema.queryRollData()`. 
 * 
 * @property {String} ob The obstacle formula. The formula must be resolved, before 
 * it can be evaluated! 
 * @property {Number} bonusDice Additional dice to roll or if negative, the number of 
 * dice to take away for a roll. 
 * @property {Number} compensationPoints Sets the number of times the faces 
 * of misses can be turned to the next higher number, until they score a hit. 
 * @property {VisibilityMode} visbilityMode The selected visibility mode for the chat message. 
 * @property {RollDiceModifierType} rollModifier The selected roll modifier. 
 */
export default class RollQueryData {
  /**
   * Holds the data queried from the user via `RollSchema.queryRollData()`. 
   * 
   * @param {Object} args
   * @param {String} args.ob The obstacle formula. The formula must be resolved, before 
   * it can be evaluated! 
   * @param {Number | undefined} args.bonusDice Additional dice to roll or if negative, the number of 
   * dice to take away for a roll. 
   * * default `0`
   * @param {Number | undefined} args.compensationPoints Sets the number of times the faces 
   * of misses can be turned to the next higher number, until they score a hit. 
   * * default `0`
   * @param {VisibilityMode | undefined} args.visbilityMode The selected visibility mode for the chat message. 
   * * default `VISIBILITY_MODES.public`
   * @param {RollDiceModifierType | undefined} args.rollModifier The selected roll modifier. 
   * * default `ROLL_DICE_MODIFIER_TYPES.NONE`
   */
  constructor(args = {}) {
    ValidationUtil.validateOrThrow(args, ["ob"]);

    this.ob = args.ob;
    this.bonusDice = args.bonusDice ?? 0;
    this.compensationPoints = args.compensationPoints ?? 0;
    this.visbilityMode = args.visbilityMode ?? VISIBILITY_MODES.public;
    this.rollModifier = args.rollModifier ?? ROLL_DICE_MODIFIER_TYPES.NONE;
  }
}
