import { getAsChoices } from "../util/constants-utility.mjs";

/**
 * Represents a damage type. 
 * 
 * @property {String} name Internal name. 
 * @property {String} localizableName Localization key. 
 * @property {String} localizableAbbreviation Localization key for the abbreviation. 
 */
export class DamageType {
  constructor(args = {}) {
    this.name = args.name;
    this.localizableName = args.localizableName;
    this.localizableAbbreviation = args.localizableAbbreviation;
  }
}

/**
 * Represents the defined damage types.
 * 
 * @property {DamageType} none A placeholder damage type. 
 * @property {DamageType} burning The "burning" damage type. 
 * @property {DamageType} freezing The "freezing" damage type. 
 * @property {DamageType} slashing The "slashing" damage type. 
 * @property {DamageType} piercing The "piercing" damage type. 
 * @property {DamageType} bludgeoning The "bludgeoning" damage type. 
 * @property {DamageType} crushing The "crushing" damage type. 
 * @property {DamageType} poison The "poison" damage type. 
 * @property {DamageType} acid The "acid" damage type. 
 * 
 * @property {Array<ChoiceOption>} asChoices The constants of this type, as an array 
 * of `ChoiceOption`s. 
 * 
 * @constant
 */
export const DAMAGE_TYPES = {
  none: new DamageType({
    name: "none",
    localizableName: "ambersteel.general.none.label",
    localizableAbbreviation: "ambersteel.general.none.abbreviation"
  }),
  burning: new DamageType({
    name: "burning",
    localizableName: "ambersteel.damageType.burning.label",
    localizableAbbreviation: "ambersteel.damageType.burning.abbreviation"
  }),
  freezing: new DamageType({
    name: "freezing",
    localizableName: "ambersteel.damageType.freezing.label",
    localizableAbbreviation: "ambersteel.damageType.freezing.abbreviation"
  }),
  slashing: new DamageType({
    name: "slashing",
    localizableName: "ambersteel.damageType.slashing.label",
    localizableAbbreviation: "ambersteel.damageType.slashing.abbreviation"
  }),
  piercing: new DamageType({
    name: "piercing",
    localizableName: "ambersteel.damageType.piercing.label",
    localizableAbbreviation: "ambersteel.damageType.piercing.abbreviation"
  }),
  bludgeoning: new DamageType({
    name: "bludgeoning",
    localizableName: "ambersteel.damageType.bludgeoning.label",
    localizableAbbreviation: "ambersteel.damageType.bludgeoning.abbreviation"
  }),
  crushing: new DamageType({
    name: "crushing",
    localizableName: "ambersteel.damageType.crushing.label",
    localizableAbbreviation: "ambersteel.damageType.crushing.abbreviation"
  }),
  poison: new DamageType({
    name: "poison",
    localizableName: "ambersteel.damageType.poison.label",
    localizableAbbreviation: "ambersteel.damageType.poison.abbreviation"
  }),
  acid: new DamageType({
    name: "acid",
    localizableName: "ambersteel.damageType.acid.label",
    localizableAbbreviation: "ambersteel.damageType.acid.abbreviation"
  }),
  get asChoices() {
    if (this._asChoices === undefined) {
      this._asChoices = getAsChoices(this, ["asChoices", "_asChoices"]);
    }
    return this._asChoices;
  },
};