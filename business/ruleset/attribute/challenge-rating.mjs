/**
 * @param {Number} value
 * @param {Number} modifier
 * @param {Number} modified
 * * read-only
 */
export default class ChallengeRating {
  static fromDto(dto) {
    return new ChallengeRating({
      value: dto.value,
      modifier: dto.modifier,
    });
  }

  /**
   * @type {Number}
   * @readonly
   */
  get modified() { return this.value + this.modifier; }

  /**
   * @param {Object} args 
   * @param {Number | undefined} args.value 
   * @param {Number | undefined} args.modifier 
   */
  constructor(args = {}) {
    this.value = args.value ?? 0;
    this.modifier = args.modifier ?? 0;
  }

  toDto() {
    return {
      value: this.value,
      modifier: this.modifier,
    }
  };
}
