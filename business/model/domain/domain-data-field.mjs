/**
 * Abstract base class for all domain data fields, which have a data field 
 * equivalent, or in other words, which may be parsed from and mapped to 
 * objects that are persisted to the data base. 
 * 
 * @abstract Inheritors MUST implement: 
 * * `static fromDto()`
 * * `toDto()`
 */
export default class DomainDataField {
  /**
   * Returns a new instance of this domain data field, based on the given 
   * dto (= data transfer object). 
   * 
   * @param {Object} dto
   * 
   * @returns {Any}
   * 
   * @abstract
   * @static
   */
  static fromDto(dto) {
    throw new Error("Not implemented");
  }

  /**
   * Returns a dto (= data transfer object) representation of this domain 
   * data field, which can be safely persisted to the data base. 
   * 
   * As such, it MUST contain only Objects and primitive data types. Under NO 
   * circumstance may it contain references to other objects, such as document 
   * references!
   * 
   * @returns {Object}
   * @abstract
   */
  toDto() {
    throw new Error("Not implemented");
  }
}