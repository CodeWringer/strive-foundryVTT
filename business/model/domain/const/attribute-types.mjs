/**
 * Represents a character attribute classification (whether it is core, favored, secondary or penalized). 
 * 
 * @property {String} name Internal name. 
 * @property {String} localizableName Localization key. 
 * @property {String} icon
*/
export class AttributeType {
  /**
   * @param {Object} args 
   * @param {String} args.name Internal name. 
   * @param {String} args.localizableName Localization key. 
   * @param {String} args.icon 
   */
  constructor(args = {}) {
    this.name = args.name;
    this.localizableName = args.localizableName;
    this.icon = args.icon;
  }
}

/**
 * A global constant for the Attribute classifications. 
 * 
 * @constant
 * @property {AttributeType} secondary 
 * @property {AttributeType} core 
 * @property {AttributeType} favored 
 * @property {AttributeType} penalized 
 */
export const ATTRIBUTE_TYPES = {
  normal: new AttributeType({
    name: "normal",
    localizableName: "system.domain.attribute.type.normal",
  }),
  core: new AttributeType({
    name: "core",
    localizableName: "system.domain.attribute.type.core",
    icon: "ico ico-buff-themed",
  }),
  favored: new AttributeType({
    name: "favored",
    localizableName: "system.domain.attribute.type.favored",
    icon: "ico ico-buff-themed",
  }),
  penalized: new AttributeType({
    name: "penalized",
    localizableName: "system.domain.attribute.type.penalized",
    icon: "ico ico-debuff-themed",
  }),
};
