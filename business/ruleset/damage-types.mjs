import * as ConstantsUtils from "../util/constants-utility.mjs";

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
 * @property {DamageType} acid The "acid" damage type. 
 * @property {DamageType} bleeding The "bleeding" damage type. 
 * @property {DamageType} bludgeoning The "bludgeoning" damage type. 
 * @property {DamageType} burning The "burning" damage type. 
 * @property {DamageType} crushing The "crushing" damage type. 
 * @property {DamageType} electrical The "electrical" damage type. 
 * @property {DamageType} freezing The "freezing" damage type. 
 * @property {DamageType} piercing The "piercing" damage type. 
 * @property {DamageType} poison The "poison" damage type. 
 * @property {DamageType} slashing The "slashing" damage type. 
 * 
 * @constant
 */
export const DAMAGE_TYPES = {
  none: new DamageType({
    name: "none",
    localizableName: "ambersteel.general.none.label",
    localizableAbbreviation: "ambersteel.general.none.abbreviation"
  }),
  acid: new DamageType({
    name: "acid",
    localizableName: "ambersteel.damageType.acid.label",
    localizableAbbreviation: "ambersteel.damageType.acid.abbreviation"
  }),
  bleeding: new DamageType({
    name: "bleeding",
    localizableName: "ambersteel.damageType.bleeding.label",
    localizableAbbreviation: "ambersteel.damageType.bleeding.abbreviation"
  }),
  bludgeoning: new DamageType({
    name: "bludgeoning",
    localizableName: "ambersteel.damageType.bludgeoning.label",
    localizableAbbreviation: "ambersteel.damageType.bludgeoning.abbreviation"
  }),
  burning: new DamageType({
    name: "burning",
    localizableName: "ambersteel.damageType.burning.label",
    localizableAbbreviation: "ambersteel.damageType.burning.abbreviation"
  }),
  crushing: new DamageType({
    name: "crushing",
    localizableName: "ambersteel.damageType.crushing.label",
    localizableAbbreviation: "ambersteel.damageType.crushing.abbreviation"
  }),
  electrical: new DamageType({
    name: "electrical",
    localizableName: "ambersteel.damageType.electrical.label",
    localizableAbbreviation: "ambersteel.damageType.electrical.abbreviation"
  }),
  freezing: new DamageType({
    name: "freezing",
    localizableName: "ambersteel.damageType.freezing.label",
    localizableAbbreviation: "ambersteel.damageType.freezing.abbreviation"
  }),
  piercing: new DamageType({
    name: "piercing",
    localizableName: "ambersteel.damageType.piercing.label",
    localizableAbbreviation: "ambersteel.damageType.piercing.abbreviation"
  }),
  poison: new DamageType({
    name: "poison",
    localizableName: "ambersteel.damageType.poison.label",
    localizableAbbreviation: "ambersteel.damageType.poison.abbreviation"
  }),
  slashing: new DamageType({
    name: "slashing",
    localizableName: "ambersteel.damageType.slashing.label",
    localizableAbbreviation: "ambersteel.damageType.slashing.abbreviation"
  }),
};
ConstantsUtils.enrichConstant(DAMAGE_TYPES);

/**
 * Returns the CSS class of the icon that represents the given damage type. 
 * 
 * @param {DamageType} damageType 
 * 
 * @returns {String}
 */
export function getDamageTypeIconClass(damageType) {
  if (damageType.name === DAMAGE_TYPES.acid.name) {
    return "ico-damage-type-acid-solid";
  } else if (damageType.name === DAMAGE_TYPES.bleeding.name) {
    return "ico-damage-type-bleeding-solid";
  } else if (damageType.name === DAMAGE_TYPES.bludgeoning.name) {
    return "ico-damage-type-bludgeon-solid";
  } else if (damageType.name === DAMAGE_TYPES.burning.name) {
    return "ico-damage-type-burning-solid";
  } else if (damageType.name === DAMAGE_TYPES.crushing.name) {
    return "ico-damage-type-crushing-solid";
  } else if (damageType.name === DAMAGE_TYPES.electrical.name) {
    return "ico-damage-type-electrical-solid";
  } else if (damageType.name === DAMAGE_TYPES.freezing.name) {
    return "ico-damage-type-freezing-solid";
  } else if (damageType.name === DAMAGE_TYPES.piercing.name) {
    return "ico-damage-type-piercing-solid";
  } else if (damageType.name === DAMAGE_TYPES.poison.name) {
    return "ico-damage-type-poisoning-solid";
  } else if (damageType.name === DAMAGE_TYPES.slashing.name) {
    return "ico-damage-type-slash-solid";
  } else {
    return "ico-crossed-circle-solid";
  }
}
