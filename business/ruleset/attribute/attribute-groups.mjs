import * as ConstantsUtils from "../../util/constants-utility.mjs";
import { ATTRIBUTES } from "./attributes.mjs";

/**
 * Represents a character attribute group. 
 * 
 * @property {String} name Internal name. 
 * @property {String} localizableName Localization key. 
 * @property {String} localizableAbbreviation Localization key for the abbreviation. 
 * @property {Object} attributes Attributes contained in the group. 
 * @property {String | undefined} iconClass CSS class of the icon to display. 
 * E. g. `"ico-strongarm-solid"` or `"fas fa-brain"`
 */
export class AttributeGroup {
  constructor(args = {}) {
    this.name = args.name;
    this.localizableName = args.localizableName;
    this.localizableAbbreviation = args.localizableAbbreviation;
    this.attributes = args.attributes;
    this.iconClass = args.iconClass;
  }
}

/**
 * Represents the defined character attribute groups.
 * 
 * @property {AttributeGroup} physical A group of all "physical" attributes. 
 * @property {AttributeGroup} mental A group of all "mental" attributes. 
 * @property {AttributeGroup} social A group of all "social" attributes. 
 * 
 * @constant
 */
export const ATTRIBUTE_GROUPS = {
  physical: new AttributeGroup({
    name: "physical",
    localizableName: "ambersteel.character.attributeGroup.physical.label",
    localizableAbbreviation: "ambersteel.character.attributeGroup.physical.abbreviation",
    iconClass: "ico-strongarm-solid",
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
    iconClass: "ico-brain-solid",
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
    iconClass: "ico-hand-shake-solid",
    attributes: {
      empathy: ATTRIBUTES.empathy,
      oratory: ATTRIBUTES.oratory,
      willpower: ATTRIBUTES.willpower,
    }
  }),
};
ConstantsUtils.enrichConstant(ATTRIBUTE_GROUPS);

/**
 * Returns the attribute group which contains an attribute with the given name. 
 * 
 * @param {String} attributeName Name of the attribute whose group to return. 
 * 
 * @returns {AttributeGroup | undefined}
 */
export function getGroupForAttributeByName(attributeName) {
  for (const attributeGroup of ATTRIBUTE_GROUPS.asArray()) {
    for (const propertyName in attributeGroup.attributes) {
      if (attributeGroup.attributes.hasOwnProperty(propertyName) !== true) continue;

      const hasAttribute = attributeGroup.attributes[propertyName].name === attributeName;
      if (hasAttribute === true) {
        return attributeGroup;
      }
    }
  }
  return undefined;
}
