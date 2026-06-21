/**
 * Represents a character attribute classification (whether it is core, favored, secondary or penalized). 
 * 
 * @property {String} name Internal name. 
 * @property {String} localizableName Localization key. 
 * @property {String} icon
*/
export class ComparisonType {
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
 * @property {ComparisonType} LESS_THAN 
 * @property {ComparisonType} LESS_EQUALS 
 * @property {ComparisonType} EQUALS 
 * @property {ComparisonType} GREATER_THAN 
 * @property {ComparisonType} GREATER_EQUALS 
 */
export const COMPARISON_TYPES = {
  LESS_THAN: new ComparisonType({
    name: "less-than",
    localizableName: "system.TODO",
    icon: "TODO",
  }),
  LESS_EQUALS: new ComparisonType({
    name: "less-equals",
    localizableName: "system.TODO",
    icon: "TODO",
  }),
  EQUALS: new ComparisonType({
    name: "equals",
    localizableName: "system.TODO",
    icon: "TODO",
  }),
  GREATER_THAN: new ComparisonType({
    name: "greater-than",
    localizableName: "system.TODO",
    icon: "TODO",
  }),
  GREATER_EQUALS: new ComparisonType({
    name: "greater-equals",
    localizableName: "system.TODO",
    icon: "TODO",
  }),
};
