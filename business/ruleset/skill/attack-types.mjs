/**
 * Represents an attack type. 
 * 
 * @property {String} name Internal name. 
 * @property {String} localizableName Localization key. 
 * @property {String} localizableAbbreviation Localization key for the abbreviation. 
 */
export class AttackType {
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
    localizableName: "ambersteel.general.none.label",
    localizableAbbreviation: "ambersteel.general.none.abbreviation"
  }),
  singleTarget: new AttackType({
    name: "singleTarget",
    localizableName: "ambersteel.attackType.singleTarget.label",
    localizableAbbreviation: "ambersteel.attackType.singleTarget.abbreviation"
  }),
  areaOfEffect: new AttackType({
    name: "areaOfEffect",
    localizableName: "ambersteel.attackType.areaOfEffect.label",
    localizableAbbreviation: "ambersteel.attackType.areaOfEffect.abbreviation"
  }),
  multipleSingleTarget: new AttackType({
    name: "multipleSingleTarget",
    localizableName: "ambersteel.attackType.multipleSingleTarget.label",
    localizableAbbreviation: "ambersteel.attackType.multipleSingleTarget.abbreviation"
  })
};