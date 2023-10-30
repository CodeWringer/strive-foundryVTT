import * as ConstantsUtils from "../util/constants-utility.mjs";
import { validateOrThrow } from "../util/validation-utility.mjs";

/**
 * Represents a roll dice modifying type. 
 * 
 * This adjusts how many dice are rolled. 
 * 
 * @property {String} name Internal name. 
 * @property {String} localizableName Localization key. 
 */
export class RollDiceModifierType {
  constructor(args = {}) {
    this.name = args.name;
    this.localizableName = args.localizableName;
    validateOrThrow(args, ["name", "localizableName"]);
  }
}

/**
 * Represents all defined roll types. 
 * 
 * @property {RollModifyingType} NONE No modification. All available dice will be rolled. 
 * @property {RollModifyingType} HALF_ROUNDED_DOWN Half the dice, rounded down, will be rolled. 
 * @property {RollModifyingType} HALF_ROUNDED_UP Half the dice, rounded up, will be rolled. 
 * 
 * @constant
 */
export const ROLL_DICE_MODIFIER_TYPES = {
  NONE: new RollDiceModifierType({
    name: "none",
    localizableName: "ambersteel.roll.diceModifiers.none"
  }),
  HALF_ROUNDED_DOWN: new RollDiceModifierType({
    name: "halfRoundedDown",
    localizableName: "ambersteel.roll.diceModifiers.halfRoundedDown"
  }),
  HALF_ROUNDED_UP: new RollDiceModifierType({
    name: "halfRoundedUp",
    localizableName: "ambersteel.roll.diceModifiers.halfRoundedUp"
  }),
}
ConstantsUtils.enrichConstant(ROLL_DICE_MODIFIER_TYPES);
