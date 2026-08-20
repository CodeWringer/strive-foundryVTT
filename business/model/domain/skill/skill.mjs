export const Skill = {
  /**
   * Returns the number of Base Attributes a Skill has. 
   * 
   * @type {Number}
   * @readonly
   */
  baseAttributeCount: 2,

  /**
   * Returns the required total advancement progress of a Skill with the 
   * given level.
   * @param {Number} level The current level of the Skill.
   */
  getAdvancementRequirement(level) {
    return 0; // TODO #762
  }
};
