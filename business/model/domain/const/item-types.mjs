/**
 * A global constant for the internal type names of `Item` type documents. 
 * 
 * @constant
 */
export const ITEM_TYPES = {
  ASSET: "item",
  /**
   * Expertises are only pseudo-items. They don't actually have their own 
   * Item document instances. 
   */
  EXPERTISE: "expertise",
  FATE_CARD: "fateCard",
  HEALTH_CONDITION: "healthCondition",
  ILLNESS: "illness",
  INJURY: "injury",
  LANGUAGE: "language",
  MUTATION: "mutation",
  PROJECT: "project",
  RECIPE: "recipe",
  SKILL: "skill",
  TRAIT: "trait",
};
