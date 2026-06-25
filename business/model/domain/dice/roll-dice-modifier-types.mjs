import { common } from "../../../../common/_module.mjs";

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
    common.util.validation.validateOrThrow(args, ["name", "localizableName"]);
  }
}

/**
 * Represents all defined roll types. 
 * 
 * @property {RollModifyingType} none No modification. All available dice will be rolled. 
 * @property {RollModifyingType} half_rounded_down Half the dice, rounded down, will be rolled. 
 * @property {RollModifyingType} half_rounded_up Half the dice, rounded up, will be rolled. 
 * 
 * @constant
 */
export const ROLL_DICE_MODIFIER_TYPES = {
  none: new RollDiceModifierType({
    name: "none",
    localizableName: "system.roll.diceModifiers.none"
  }),
  half_rounded_down: new RollDiceModifierType({
    name: "halfRoundedDown",
    localizableName: "system.roll.diceModifiers.halfRoundedDown"
  }),
  half_rounded_up: new RollDiceModifierType({
    name: "halfRoundedUp",
    localizableName: "system.roll.diceModifiers.halfRoundedUp"
  }),
}
