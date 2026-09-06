/**
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
 * @property {ComparisonType} less_than 
 * @property {ComparisonType} less_equals 
 * @property {ComparisonType} equals 
 * @property {ComparisonType} greater_than 
 * @property {ComparisonType} greater_equals 
 */
export const COMPARISON_TYPES = {
  less_than: new ComparisonType({
    name: "less_than",
    localizableName: "system.general.comparisonType.lessThan",
    icon: "ico ico-less-than",
  }),
  less_equals: new ComparisonType({
    name: "less_equals",
    localizableName: "system.general.comparisonType.lessEquals",
    icon: "ico ico-less-than-equals",
  }),
  equals: new ComparisonType({
    name: "equals",
    localizableName: "system.general.comparisonType.equals",
    icon: "ico ico-equals",
  }),
  greater_than: new ComparisonType({
    name: "greater_than",
    localizableName: "system.general.comparisonType.greaterThan",
    icon: "ico ico-greater-than",
  }),
  greater_equals: new ComparisonType({
    name: "greater_equals",
    localizableName: "system.general.comparisonType.greaterEquals",
    icon: "ico ico-greater-than-equals",
  }),
};
