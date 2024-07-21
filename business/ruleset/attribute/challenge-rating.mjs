/**
 * @param {Number} value The current "level" or raw challenge rating. 
 * @param {Number} modifier Modifier to add or subtract to/from the raw challenge rating. 
 * @param {Number} modified Sum of `value` and `modifier`. 
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
   * Sum of `value` and `modifier`. 
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
