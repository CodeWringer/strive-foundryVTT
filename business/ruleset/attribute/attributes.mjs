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
 * @property {Attribute} endurance A character's "endurance" attribute. 
 * @property {Attribute} perception A character's "perception" attribute. 
 * @property {Attribute} strength A character's "strength" attribute. 
 * @property {Attribute} toughness A character's "toughness" attribute. 
 * @property {Attribute} intelligence A character's "intelligence" attribute. 
 * @property {Attribute} wisdom A character's "wisdom" attribute. 
 * @property {Attribute} arcana A character's "arcana" attribute. 
 * @property {Attribute} empathy A character's "empathy" attribute. 
 * @property {Attribute} oratory A character's "oratory" attribute. 
 * @property {Attribute} willpower A character's "willpower" attribute. 
 * 
 * @constant
 */
export const ATTRIBUTES = {
  agility: new Attribute({
    name: "agility",
    localizableName: "system.character.attribute.agility.label",
    localizableAbbreviation: "system.character.attribute.agility.abbreviation"
  }),
  endurance: new Attribute({
    name: "endurance",
    localizableName: "system.character.attribute.endurance.label",
    localizableAbbreviation: "system.character.attribute.endurance.abbreviation"
  }),
  perception: new Attribute({
    name: "perception",
    localizableName: "system.character.attribute.perception.label",
    localizableAbbreviation: "system.character.attribute.perception.abbreviation"
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
  intelligence: new Attribute({
    name: "intelligence",
    localizableName: "system.character.attribute.intelligence.label",
    localizableAbbreviation: "system.character.attribute.intelligence.abbreviation"
  }),
  wisdom: new Attribute({
    name: "wisdom",
    localizableName: "system.character.attribute.wisdom.label",
    localizableAbbreviation: "system.character.attribute.wisdom.abbreviation"
  }),
  arcana: new Attribute({
    name: "arcana",
    localizableName: "system.character.attribute.arcana.label",
    localizableAbbreviation: "system.character.attribute.arcana.abbreviation"
  }),
  empathy: new Attribute({
    name: "empathy",
    localizableName: "system.character.attribute.empathy.label",
    localizableAbbreviation: "system.character.attribute.empathy.abbreviation"
  }),
  oratory: new Attribute({
    name: "oratory",
    localizableName: "system.character.attribute.oratory.label",
    localizableAbbreviation: "system.character.attribute.oratory.abbreviation"
  }),
  willpower: new Attribute({
    name: "willpower",
    localizableName: "system.character.attribute.willpower.label",
    localizableAbbreviation: "system.character.attribute.willpower.abbreviation"
  }),
};
ConstantsUtils.enrichConstant(ATTRIBUTES);
