import { getAsChoices } from "../../util/constants-utility.mjs";

/**
 * Represents a shield type. 
 * 
 * @property {String} name Internal name. 
 * @property {String} localizableName Localization key. 
 */
export class ShieldType {
  constructor(args = {}) {
    this.name = args.name;
    this.localizableName = args.localizableName;
  }
}

/**
 * Represents the defined shield types.
 * 
 * @property {ShieldType} buckler 
 * @property {ShieldType} roundShield 
 * @property {ShieldType} heaterShield 
 * @property {ShieldType} kiteShield 
 * 
 * @property {Array<ChoiceOption>} asChoices The constants of this type, as an array 
 * of `ChoiceOption`s. 
 * 
 * @constant
 */
export const SHIELD_TYPES = {
  buckler: new ShieldType({
    name: "buckler",
    localizableName: "ambersteel.character.asset.type.shield.buckler"
  }),
  roundShield: new ShieldType({
    name: "roundShield",
    localizableName: "ambersteel.character.asset.type.shield.roundShield"
  }),
  heaterShield: new ShieldType({
    name: "heaterShield",
    localizableName: "ambersteel.character.asset.type.shield.heaterShield"
  }),
  kiteShield: new ShieldType({
    name: "kiteShield",
    localizableName: "ambersteel.character.asset.type.shield.kiteShield"
  }),
  get asChoices() {
    if (this._asChoices === undefined) {
      this._asChoices = getAsChoices(this, ["asChoices", "_asChoices"]);
    }
    return this._asChoices;
  },
};