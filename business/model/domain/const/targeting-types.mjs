/**
 * Represents an attack type. 
 * 
 * @property {String} name Internal name. 
 * @property {String} localizableName Localization key. 
 * @property {String} icon
 */
export class TargetingType {
  /**
   * @param {Object} args 
   * @param {String} args.name 
   * @param {String} args.localizableName 
   * @param {String} args.icon 
   */
  constructor(args = {}) {
    this.name = args.name;
    this.localizableName = args.localizableName;
    this.icon = args.icon;
  }
}

/**
 * Represents the defined attack types.
 * 
 * @property {TargetingType} singleTarget
 * @property {TargetingType} areaOfEffect
 * @property {TargetingType} multipleSingleTarget
 * 
 * @constant
 */
export const TARGETING_TYPES = {
  singleTarget: new TargetingType({
    name: "singleTarget",
    localizableName: "system.domain.targetingType.singleTarget",
    icon: "ico ico-targeting-type-single",
  }),
  areaOfEffect: new TargetingType({
    name: "areaOfEffect",
    localizableName: "system.domain.targetingType.areaOfEffect",
    icon: "ico ico-targeting-type-aoe",
  }),
  multipleSingleTarget: new TargetingType({
    name: "multipleSingleTarget",
    localizableName: "system.domain.targetingType.multipleSingleTarget",
    icon: "ico ico-targeting-type-multi",
  }),
};
