import Persistable from "./persistable.mjs";
import Modifier from "./modifier.mjs";
import { COMPARISON_TYPES, ComparisonType } from "./const/comparison-types.mjs";

/**
 * Represents a graded effect. 
 * 
 * For example, this can be used to represent the damage gradings based 
 * on the number of Hits an attacker achieved. 
 * 
 * The combination of `comparison`, `threshold` and `comparisonTarget` 
 * results in the grading. For example "greater or equal to 3 Hits":
 * `comparison: COMPARISON_TYPES.greater_equals`, `threshold: 3`, 
 * `comparisonTarget: hit`
 * 
 * @property {ComparisonType} comparisonType 
 * @property {Number} threshold 
 * @property {String} comparisonTarget Any at-referencable target. 
 * E. g. `"hit"` or `"agility"`
 * @property {String} effect
 * @property {Array<Modifier>} modifiers Fire-and-forget modifiers that 
 * will be applied by this effect. 
 * 
 * @extends Persistable
 */
export default class GradedEffect extends Persistable {
  /** @override */
  static fromDto(dto) {
    return new GradedEffect({
      comparisonType: COMPARISON_TYPES[dto.comparisonType],
      threshold: dto.threshold,
      comparisonTarget: dto.comparisonTarget,
      effect: dto.effect,
      modifiers: dto.modifiers.map(it => Modifier.fromDto(it)),
    });
  }

  /**
   * @param {Object} args 
   * @param {ComparisonType} args.comparisonType 
   * @param {Number} args.threshold 
   * @param {String} args.comparisonTarget 
   * E. g. `"hit"` or `"agility"`
   * @param {String} args.effect 
   * @param {Array<Modifier> | undefined} args.modifiers Fire-and-forget modifiers that 
   * will be applied by this effect. 
   */
  constructor(args = {}) {
    super(args);
    
    this.comparisonType = args.comparisonType;
    this.threshold = args.threshold;
    this.comparisonTarget = args.comparisonTarget;

    this.effect = args.effect ?? "";
    this.modifiers = args.modifiers ?? [];
  }

  /** @override */
  toDto() {
    return {
      comparisonType: this.comparisonType.name,
      threshold: this.threshold,
      comparisonTarget: this.comparisonTarget,
      effect: this.effect,
      modifiers: this.modifiers.map(it => it.toDto()),
    };
  }
}
