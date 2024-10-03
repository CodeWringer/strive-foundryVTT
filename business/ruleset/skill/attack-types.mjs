import { ConstantsUtil } from "../../util/constants-utility.mjs";

/**
 * Represents an attack type. 
 * 
 * @property {String} name Internal name. 
 * @property {String} localizableName Localization key. 
 * @property {String} localizableAbbreviation Localization key for the abbreviation. 
 */
export class AttackType {
  /**
   * @param {Object} args 
   * @param {String} args.name 
   * @param {String} args.localizableName 
   * @param {String} args.localizableAbbreviation 
   */
  constructor(args = {}) {
    this.name = args.name;
    this.localizableName = args.localizableName;
    this.localizableAbbreviation = args.localizableAbbreviation;
  }
}

/**
 * Represents the defined attack types.
 * 
 * @property {AttackType} none A placeholder/undefined attack type. 
 * @property {AttackType} singleTarget
 * @property {AttackType} areaOfEffect
 * @property {AttackType} multipleSingleTarget
 * 
 * @constant
 */
export const ATTACK_TYPES = {
  none: new AttackType({
    name: "none",
    localizableName: "system.general.none.label",
    localizableAbbreviation: "system.general.none.abbreviation"
  }),
  singleTarget: new AttackType({
    name: "singleTarget",
    localizableName: "system.attackType.singleTarget.label",
    localizableAbbreviation: "system.attackType.singleTarget.abbreviation"
  }),
  areaOfEffect: new AttackType({
    name: "areaOfEffect",
    localizableName: "system.attackType.areaOfEffect.label",
    localizableAbbreviation: "system.attackType.areaOfEffect.abbreviation"
  }),
  multipleSingleTarget: new AttackType({
    name: "multipleSingleTarget",
    localizableName: "system.attackType.multipleSingleTarget.label",
    localizableAbbreviation: "system.attackType.multipleSingleTarget.abbreviation"
  }),
};
ConstantsUtil.enrichConstant(ATTACK_TYPES);

/**
 * Returns the CSS class of the icon that represents the given attack type. 
 * 
 * @param {AttackType} attackType 
 * 
 * @returns {String}
 */
export function getAttackTypeIconClass(attackType) {
  if (attackType.name === ATTACK_TYPES.areaOfEffect.name) {
    return "ico-attack-type-aoe-solid";
  } else if (attackType.name === ATTACK_TYPES.multipleSingleTarget.name) {
    return "ico-attack-type-multi-solid";
  } else if (attackType.name === ATTACK_TYPES.singleTarget.name) {
    return "ico-attack-type-single-solid";
  } else {
    return "ico-crossed-circle-solid";
  }
}
