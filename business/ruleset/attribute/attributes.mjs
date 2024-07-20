import * as ConstantsUtils from "../../util/constants-utility.mjs";

/**
 * Represents a character attribute. 
 * 
 * @property {String} name Internal name. 
 * @property {String} localizableName Localization key. 
 * @property {String} localizableAbbreviation Localization key for the abbreviation. 
*/
export class Attribute {
  /**
   * @param {Object} args 
   * @param {String} args.name Internal name. 
   * @param {String} args.localizableName Localization key. 
   * @param {String} args.localizableAbbreviation Localization key for the abbreviation. 
   */
  constructor(args = {}) {
    this.name = args.name;
    this.localizableName = args.localizableName;
    this.localizableAbbreviation = args.localizableAbbreviation;
  }
}

/**
 * Represents the defined character attributes.
 * 
 * @property {Attribute} agility A character's "agility" attribute. 
 * @property {Attribute} awareness A character's "awareness" attribute. 
 * @property {Attribute} arcana A character's "arcana" attribute. 
 * @property {Attribute} strength A character's "strength" attribute. 
 * @property {Attribute} toughness A character's "toughness" attribute. 
 * @property {Attribute} wit A character's "wit" attribute. 
 * 
 * @constant
 */
export const ATTRIBUTES = {
  agility: new Attribute({
    name: "agility",
    localizableName: "system.character.attribute.agility.label",
    localizableAbbreviation: "system.character.attribute.agility.abbreviation"
  }),
  arcana: new Attribute({
    name: "arcana",
    localizableName: "system.character.attribute.arcana.label",
    localizableAbbreviation: "system.character.attribute.arcana.abbreviation"
  }),
  awareness: new Attribute({
    name: "awareness",
    localizableName: "system.character.attribute.awareness.label",
    localizableAbbreviation: "system.character.attribute.awareness.abbreviation"
  }),
  strength: new Attribute({
    name: "strength",
    localizableName: "system.character.attribute.strength.label",
    localizableAbbreviation: "system.character.attribute.strength.abbreviation"
  }),
  toughness: new Attribute({
    name: "toughness",
    localizableName: "system.character.attribute.toughness.label",
    localizableAbbreviation: "system.character.attribute.toughness.abbreviation"
  }),
  wit: new Attribute({
    name: "wit",
    localizableName: "system.character.attribute.wit.label",
    localizableAbbreviation: "system.character.attribute.wit.abbreviation"
  }),
};
ConstantsUtils.enrichConstant(ATTRIBUTES);
