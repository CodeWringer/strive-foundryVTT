import DomainDataField from "../domain-data-field.mjs";

/**
 * Represents a specific Attribute of a character. 
 * 
 * @property {String} name Internal name of the attribute. 
 * @property {Number} level Raw level.
 */
export default class CharacterAttribute extends DomainDataField {
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
