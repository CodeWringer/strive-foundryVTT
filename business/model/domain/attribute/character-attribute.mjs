import Persistable from "../persistable.mjs";

/**
 * Represents a specific Attribute of a character. 
 * 
 * @property {String} name Internal name of the attribute. 
 * @property {Number} level Raw level.
 * 
 * @extends Persistable
 */
export default class CharacterAttribute extends Persistable {
  static fromDto(dto) {
    return new CharacterAttribute({
      name: dto.name,
      level: dto.level,
    });
  }

  /**
   * @param {Object} args
   * @param {String} args.name
   * @param {Number} args.level
   */
  constructor(args = {}) {
    super(args);

    this.name = args.name;
    this.level = args.level;
  }

  toDto() {
    return {
      name: this.name,
      level: this.level,
    };
  }
}
