/**
 * Represents a skill ability. 
 */
export default class SkillAbility {
  constructor(name, description, requiredLevel, apCost, condition) {
    this.name = name;
    this.description = description;
    this.requiredLevel = requiredLevel;
    this.apCost = apCost;
    this.condition = condition;
  }
}