/**
 * @property {String} name Internal name. 
 * @property {String} localizableName Localization key. 
 * @property {String} icon
*/
export class ComparisonTargetType {
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
 * @constant
 * @property {ComparisonTargetType} hit Requires no additional data. 
 * @property {ComparisonTargetType} attribute Requires an at-reference pointing 
 * at an Attribute. 
 */
export const COMPARISON_TARGET_TYPES = {
  hit: new ComparisonTargetType({
    name: "hit",
    localizableName: "system.general.hit",
    icon: "TODO",
  }),
  attribute: new ComparisonTargetType({
    name: "attribute",
    localizableName: "system.domain.attribute.attribute",
    icon: "TODO",
  }),
};
