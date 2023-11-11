/**
 * @property {String | Number | Boolean} key
 * @property {String | Number | Boolean | undefined | null} value
 */
export default class KeyValuePair {
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

  toDto() {
    return {
      key: this.key,
      value: this.value,
    };
  }
}