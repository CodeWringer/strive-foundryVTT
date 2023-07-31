import { getAsArray, getAsChoices } from "../util/constants-utility.mjs";

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
  }
}

/**
 * Represents all defined roll types. 
 * 
 * @property {RollModifyingType} NONE No modification. All available dice will be rolled. 
 * @property {RollModifyingType} HALF_ROUNDED_DOWN Half the dice, rounded down, will be rolled. 
 * @property {RollModifyingType} HALF_ROUNDED_UP Half the dice, rounded up, will be rolled. 
 * 
 * @property {Array<ChoiceOption>} asChoices The constants of this type, as an array 
 * of `ChoiceOption`s. 
 * @property {Array<VisibilityMode>} asArray The constants of this type, as an array. 
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
  get asChoices() {
    if (this._asChoices === undefined) {
      this._asChoices = getAsChoices(this, ["asChoices", "_asChoices", "asArray", "_asArray"]);
    }
    return this._asChoices;
  },
  get asArray() {
    if (this._asArray === undefined) {
      this._asArray = getAsArray(this, ["asChoices", "_asChoices", "asArray", "_asArray"]);
    }
    return this._asArray;
  },
}