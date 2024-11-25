import { ConstantsUtil } from "../util/constants-utility.mjs";

/**
 * Represents a damage type. 
 * 
 * @property {String} name Internal name. 
 * @property {String} localizableName Localization key. 
 * @property {String} localizableAbbreviation Localization key for the abbreviation. 
 * @property {String} iconClass An icon representation. 
 */
export class DamageType {
  constructor(args = {}) {
    this.name = args.name;
    this.localizableName = args.localizableName;
    this.localizableAbbreviation = args.localizableAbbreviation;
    this.iconClass = args.iconClass;
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
    localizableName: "system.general.none.label",
    localizableAbbreviation: "system.general.none.abbreviation",
    iconClass: "ico-crossed-circle-solid"
  }),
  acid: new DamageType({
    name: "acid",
    localizableName: "system.damageType.acid.label",
    localizableAbbreviation: "system.damageType.acid.abbreviation",
    iconClass: "ico-damage-type-acid-solid"
  }),
  bleeding: new DamageType({
    name: "bleeding",
    localizableName: "system.damageType.bleeding.label",
    localizableAbbreviation: "system.damageType.bleeding.abbreviation",
    iconClass: "ico-damage-type-bleeding-solid"
  }),
  bludgeoning: new DamageType({
    name: "bludgeoning",
    localizableName: "system.damageType.bludgeoning.label",
    localizableAbbreviation: "system.damageType.bludgeoning.abbreviation",
    iconClass: "ico-damage-type-bludgeon-solid"
  }),
  burning: new DamageType({
    name: "burning",
    localizableName: "system.damageType.burning.label",
    localizableAbbreviation: "system.damageType.burning.abbreviation",
    iconClass: "ico-damage-type-burning-solid"
  }),
  electrical: new DamageType({
    name: "electrical",
    localizableName: "system.damageType.electrical.label",
    localizableAbbreviation: "system.damageType.electrical.abbreviation",
    iconClass: "ico-damage-type-electrical-solid"
  }),
  freezing: new DamageType({
    name: "freezing",
    localizableName: "system.damageType.freezing.label",
    localizableAbbreviation: "system.damageType.freezing.abbreviation",
    iconClass: "ico-damage-type-freezing-solid"
  }),
  piercing: new DamageType({
    name: "piercing",
    localizableName: "system.damageType.piercing.label",
    localizableAbbreviation: "system.damageType.piercing.abbreviation",
    iconClass: "ico-damage-type-piercing-solid"
  }),
  poison: new DamageType({
    name: "poison",
    localizableName: "system.damageType.poison.label",
    localizableAbbreviation: "system.damageType.poison.abbreviation",
    iconClass: "ico-damage-type-poisoning-solid"
  }),
  slashing: new DamageType({
    name: "slashing",
    localizableName: "system.damageType.slashing.label",
    localizableAbbreviation: "system.damageType.slashing.abbreviation",
    iconClass: "ico-damage-type-slash-solid"
  }),
};
ConstantsUtil.enrichConstant(DAMAGE_TYPES);
