import { COMPARISON_TARGET_TYPES } from "./const/comparison-target-types.mjs";
import { ComparisonType } from "./const/comparison-types.mjs";
import Persistable from "./persistable.mjs";

export default class ComparisonTarget extends Persistable {
  /** @override */
  static fromDto(dto) {
    return new ComparisonTarget({
      type: COMPARISON_TARGET_TYPES[dto.type],
      data: dto.data,
    });
  }

  /**
   * @param {Object} args 
   * @param {ComparisonType | undefined} args.type 
   * @param {String | undefined} args.data An at-referencable string, if necessary. 
   */
  constructor(args = {}) {
    this.type = args.type ?? COMPARISON_TARGET_TYPES.hit;
    this.data = args.data;
  }

  /** @override */
  toDto() {
    return {
      type: this.type.name,
      data: this.data,
    };
  }
}
