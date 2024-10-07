/**
 * Describes a prerequisite skill. 
 * 
 * @property {String | undefined} id ID of the skill. 
 * @property {String | undefined} name Name of the skill. Is used to find the skill definition, should 
 * the ID yield no result. 
 * @property {Number} minimumLevel The level of the prerequisite skill requirement. 
 */
export default class SkillPrerequisite {
  static fromDto(dto) {
    return new SkillPrerequisite({
      id: dto.id,
      name: dto.name,
      minimumLevel: dto.minimumLevel,
    });
  }

  /**
   * @param {Object} args Arguments object
   * @param {String | undefined} args.id ID of the skill. 
   * @param {String | undefined} args.name Name of the skill. Is used to find the skill definition, should 
   * the ID yield no result. 
   * @param {Number | undefined} args.minimumLevel The level of the prerequisite skill requirement. 
   */
  constructor(args = {}) {
    this.id = args.id;
    this.name = args.name;
    this.minimumLevel = args.minimumLevel ?? 0;
  }

  toDto() {
    return {
      id: this.id,
      name: this.name,
      minimumLevel: this.minimumLevel,
    };
  }
}