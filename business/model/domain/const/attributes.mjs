/**
 * Represents a character attribute. 
 * 
 * @property {String} name Internal name. 
 * @property {String} localizableName Localization key. 
 * @property {String} localizableAbbreviation Localization key for the abbreviation. 
 * @property {String} icon
*/
export class Attribute {
  /**
   * @param {Object} args 
   * @param {String} args.name Internal name. 
   * @param {String} args.localizableName Localization key. 
   * @param {String} args.localizableAbbreviation Localization key for the abbreviation. 
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
 * Represents the defined character attributes.
 * 
 * @property {Attribute} agility A character's "agility" attribute. 
 * @property {Attribute} awareness A character's "awareness" attribute. 
 * @property {Attribute} strength A character's "strength" attribute. 
 * @property {Attribute} toughness A character's "toughness" attribute. 
 * @property {Attribute} wit A character's "wit" attribute. 
 * 
 * @constant
 */
export const ATTRIBUTES = {
  agility: new Attribute({
    name: "agility",
    localizableName: "system.domain.attribute.agility.agility",
    localizableAbbreviation: "system.domain.attribute.agility.abbreviation",
    icon: "ico-agility-solid",
  }),
  awareness: new Attribute({
    name: "awareness",
    localizableName: "system.domain.attribute.awareness.awareness",
    localizableAbbreviation: "system.domain.attribute.awareness.abbreviation",
    icon: "ico-awareness-solid",
  }),
  strength: new Attribute({
    name: "strength",
    localizableName: "system.domain.attribute.strength.strength",
    localizableAbbreviation: "system.domain.attribute.strength.abbreviation",
    icon: "ico-strength-solid",
  }),
  toughness: new Attribute({
    name: "toughness",
    localizableName: "system.domain.attribute.toughness.toughness",
    localizableAbbreviation: "system.domain.attribute.toughness.abbreviation",
    icon: "ico-toughness-solid",
  }),
  wit: new Attribute({
    name: "wit",
    localizableName: "system.domain.attribute.wit.wit",
    localizableAbbreviation: "system.domain.attribute.wit.abbreviation",
    icon: "ico-wit-solid",
  }),
};
