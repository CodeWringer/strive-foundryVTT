/**
 * Represents a character attribute. 
 * 
 * @property {String} name Internal name. 
 * @property {String} localizableName Localization key. 
 * @property {String} localizableAbbreviation Localization key for the abbreviation. 
 */
export class Attribute {
  constructor(args = {}) {
    this.name = args.name;
    this.localizableName = args.localizableName;
    this.localizableAbbreviation = args.localizableAbbreviation;
  }
}

export const ATTRIBUTES = {
  agility: new Attribute({
    name: "agility",
    localizableName: "ambersteel.character.attribute.agility.label",
    localizableAbbreviation: "ambersteel.character.attribute.agility.abbreviation"
  }),
  endurance: new Attribute({
    name: "endurance",
    localizableName: "ambersteel.character.attribute.endurance.label",
    localizableAbbreviation: "ambersteel.character.attribute.endurance.abbreviation"
  }),
  perception: new Attribute({
    name: "perception",
    localizableName: "ambersteel.character.attribute.perception.label",
    localizableAbbreviation: "ambersteel.character.attribute.perception.abbreviation"
  }),
  strength: new Attribute({
    name: "strength",
    localizableName: "ambersteel.character.attribute.strength.label",
    localizableAbbreviation: "ambersteel.character.attribute.strength.abbreviation"
  }),
  toughness: new Attribute({
    name: "toughness",
    localizableName: "ambersteel.character.attribute.toughness.label",
    localizableAbbreviation: "ambersteel.character.attribute.toughness.abbreviation"
  }),
  intelligence: new Attribute({
    name: "intelligence",
    localizableName: "ambersteel.character.attribute.intelligence.label",
    localizableAbbreviation: "ambersteel.character.attribute.intelligence.abbreviation"
  }),
  wisdom: new Attribute({
    name: "wisdom",
    localizableName: "ambersteel.character.attribute.wisdom.label",
    localizableAbbreviation: "ambersteel.character.attribute.wisdom.abbreviation"
  }),
  arcana: new Attribute({
    name: "arcana",
    localizableName: "ambersteel.character.attribute.arcana.label",
    localizableAbbreviation: "ambersteel.character.attribute.arcana.abbreviation"
  }),
  empathy: new Attribute({
    name: "empathy",
    localizableName: "ambersteel.character.attribute.empathy.label",
    localizableAbbreviation: "ambersteel.character.attribute.empathy.abbreviation"
  }),
  oratory: new Attribute({
    name: "oratory",
    localizableName: "ambersteel.character.attribute.oratory.label",
    localizableAbbreviation: "ambersteel.character.attribute.oratory.abbreviation"
  }),
  willpower: new Attribute({
    name: "willpower",
    localizableName: "ambersteel.character.attribute.willpower.label",
    localizableAbbreviation: "ambersteel.character.attribute.willpower.abbreviation"
  })
};