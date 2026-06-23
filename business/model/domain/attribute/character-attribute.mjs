import Persistable from "../persistable.mjs";

/**
 * Represents a specific Attribute of a character. 
 * 
 * @property {String} name Internal name of the attribute. 
 * @property {Number} level Raw level.
 */
export default class CharacterAttribute extends Persistable {
  /**
   * @param {Object} args
   * @param {String} args.name
   * @param {Number} args.level
   */
  constructor(args = {}) {
    this.name = args.name;
    this.level = args.level;
  }
}
