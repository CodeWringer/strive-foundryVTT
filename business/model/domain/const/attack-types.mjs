/**
 * Represents an attack type. 
 * 
 * @property {String} name Internal name. 
 * @property {String} localizableName Localization key. 
 * @property {String} localizableAbbreviation Localization key for the abbreviation. 
 * @property {String} icon
 */
export class AttackType {
  /**
   * @param {Object} args 
   * @param {String} args.name 
   * @param {String} args.localizableName 
   * @param {String} args.localizableAbbreviation 
   * @param {String} args.icon 
   */
  constructor(args = {}) {
    this.name = args.name;
    this.localizableName = args.localizableName;
    this.localizableAbbreviation = args.localizableAbbreviation;
    this.icon = args.icon;
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
    localizableAbbreviation: "system.general.none.abbreviation",
    icon: "ico-crossed-circle-solid",
  }),
  singleTarget: new AttackType({
    name: "singleTarget",
    localizableName: "system.attackType.singleTarget.label",
    localizableAbbreviation: "system.attackType.singleTarget.abbreviation",
    icon: "ico-attack-type-single-solid",
  }),
  areaOfEffect: new AttackType({
    name: "areaOfEffect",
    localizableName: "system.attackType.areaOfEffect.label",
    localizableAbbreviation: "system.attackType.areaOfEffect.abbreviation",
    icon: "ico-attack-type-aoe-solid",
  }),
  multipleSingleTarget: new AttackType({
    name: "multipleSingleTarget",
    localizableName: "system.attackType.multipleSingleTarget.label",
    localizableAbbreviation: "system.attackType.multipleSingleTarget.abbreviation",
    icon: "ico-attack-type-multi-solid",
  }),
};
