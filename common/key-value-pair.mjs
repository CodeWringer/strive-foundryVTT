import { isDefined } from "../business/util/validation-utility.mjs";

/**
 * Represents a value associated with a specific key. 
 * 
 * @property {String | Number | Boolean} key
 * @property {String | Number | Boolean | undefined | null} value
 */
export default class KeyValuePair {
  /**
   * Returns a new instance of this type, parsed from the given DTO. 
   * 
   * @param {Object} dto 
   * 
   * @returns {KeyValuePair}
   * 
   * @static
   */
  static fromDto(dto) {
    return new KeyValuePair(dto.key, dto.value);
  }

  /**
   * @param {String | Number | Boolean} key
   * @param {String | Number | Boolean | undefined | null} value
   */
  constructor(key, value) {
    this.key = key;
    this.value = value;
  }

  /**
   * Returns a DTO representation of this object. 
   * 
   * @returns {Object}
   */
  toDto() {
    return {
      key: this.key,
      value: isDefined((this.value ?? {}).toDto) ? this.value.toDto() : this.value,
    };
  }
}