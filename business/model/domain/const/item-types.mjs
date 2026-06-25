/**
 * A global constant for the internal type names of `Item` type documents. 
 * 
 * @constant
 */
export const ITEM_TYPES = {
  asset: "item",
  /**
   * Expertises are only pseudo-items. They don't actually have their own 
   * Item document instances. 
   */
  expertise: "expertise",
  fate_card: "fateCard",
  health_condition: "healthCondition",
  illness: "illness",
  injury: "injury",
  language: "language",
  mutation: "mutation",
  project: "project",
  recipe: "recipe",
  skill: "skill",
  trait: "trait",
};
