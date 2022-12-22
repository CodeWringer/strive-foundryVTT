import { getAsChoices } from "../../util/constants-utility.mjs";
import { ATTRIBUTES } from "./attributes.mjs";

/**
 * Represents a character attribute group. 
 * 
 * @property {String} name Internal name. 
 * @property {String} localizableName Localization key. 
 * @property {String} localizableAbbreviation Localization key for the abbreviation. 
 * @property {Object} attributes Attributes contained in the group. 
 */
export class AttributeGroup {
  constructor(args = {}) {
    this.name = args.name;
    this.localizableName = args.localizableName;
    this.localizableAbbreviation = args.localizableAbbreviation;
    this.attributes = args.attributes;
  }
}

/**
 * Represents the defined character attribute groups.
 * 
 * @property {AttributeGroup} physical A group of all "physical" attributes. 
 * @property {AttributeGroup} mental A group of all "mental" attributes. 
 * @property {AttributeGroup} social A group of all "social" attributes. 
 * 
 * @property {Array<ChoiceOption>} asChoices The constants of this type, as an array 
 * of `ChoiceOption`s. 
 * 
 * @constant
 */
export const ATTRIBUTE_GROUPS = {
  physical: new AttributeGroup({
    name: "physical",
    localizableName: "ambersteel.character.attributeGroup.physical.label",
    localizableAbbreviation: "ambersteel.character.attributeGroup.physical.abbreviation",
    attributes: {
      agility: ATTRIBUTES.agility,
      endurance: ATTRIBUTES.endurance,
      perception: ATTRIBUTES.perception,
      strength: ATTRIBUTES.strength,
      toughness: ATTRIBUTES.toughness,
    }
  }),
  mental: new AttributeGroup({
    name: "mental",
    localizableName: "ambersteel.character.attributeGroup.mental.label",
    localizableAbbreviation: "ambersteel.character.attributeGroup.mental.abbreviation",
    attributes: {
      intelligence: ATTRIBUTES.intelligence,
      wisdom: ATTRIBUTES.wisdom,
      arcana: ATTRIBUTES.arcana,
    }
  }),
  social: new AttributeGroup({
    name: "social",
    localizableName: "ambersteel.character.attributeGroup.social.label",
    localizableAbbreviation: "ambersteel.character.attributeGroup.social.abbreviation",
    attributes: {
      empathy: ATTRIBUTES.empathy,
      oratory: ATTRIBUTES.oratory,
      willpower: ATTRIBUTES.willpower,
    }
  }),
  get asChoices() {
    if (this._asChoices === undefined) {
      this._asChoices = getAsChoices(this, ["asChoices", "_asChoices"]);
    }
    return this._asChoices;
  },
};