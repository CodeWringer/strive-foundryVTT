import { ATTRIBUTES } from "./attributes.mjs";

export const ATTRIBUTE_GROUPS = {
  physical: {
    name: "physical",
    localizableName: "ambersteel.character.attributeGroup.physical.label",
    attributes: {
      agility: ATTRIBUTES.agility,
      endurance: ATTRIBUTES.endurance,
      perception: ATTRIBUTES.perception,
      strength: ATTRIBUTES.strength,
      toughness: ATTRIBUTES.toughness,
    }
  },
  mental: {
    name: "mental",
    localizableName: "ambersteel.character.attributeGroup.mental.label",
    attributes: {
      intelligence: ATTRIBUTES.intelligence,
      wisdom: ATTRIBUTES.wisdom,
      arcana: ATTRIBUTES.arcana,
    }
  },
  social: {
    name: "social",
    localizableName: "ambersteel.character.attributeGroup.social.label",
    attributes: {
      empathy: ATTRIBUTES.empathy,
      oratory: ATTRIBUTES.oratory,
      willpower: ATTRIBUTES.willpower,
    }
  }
};