import { ATTRIBUTES } from "./attributes.mjs";

export const ATTRIBUTE_GROUPS = {
  physical: {
    name: "physical",
    localizableName: "ambersteel.attributeGroups.physical",
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
    localizableName: "ambersteel.attributeGroups.mental",
    attributes: {
      intelligence: ATTRIBUTES.intelligence,
      wisdom: ATTRIBUTES.wisdom,
      arcana: ATTRIBUTES.arcana,
    }
  },
  social: {
    name: "social",
    localizableName: "ambersteel.attributeGroups.social",
    attributes: {
      empathy: ATTRIBUTES.empathy,
      oratory: ATTRIBUTES.oratory,
      willpower: ATTRIBUTES.willpower,
    }
  }
};