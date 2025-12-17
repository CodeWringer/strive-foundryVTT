import { ConstantsUtil } from "../../util/constants-utility.mjs";

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
 * @property {AttributeType} SECONDARY 
 * @property {AttributeType} CORE 
 * @property {AttributeType} FAVORED 
 * @property {AttributeType} PENALIZED 
 */
export const ATTRIBUTE_TYPES = {
  SECONDARY: new AttributeType({
    name: "secondary",
    localizableName: "system.character.attribute.type.secondary",
  }),
  CORE: new AttributeType({
    name: "core",
    localizableName: "system.character.attribute.type.core",
    icon: "ico ico-buff-themed",
  }),
  FAVORED: new AttributeType({
    name: "favored",
    localizableName: "system.character.attribute.type.favored",
    icon: "ico ico-buff-themed",
  }),
  PENALIZED: new AttributeType({
    name: "penalized",
    localizableName: "system.character.attribute.type.penalized",
    icon: "ico ico-debuff-themed",
  }),
};
ConstantsUtil.enrichConstant(ATTRIBUTE_TYPES);
