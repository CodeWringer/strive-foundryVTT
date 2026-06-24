import { COMPARISON_TYPES, ComparisonType } from "../const/comparison-types.mjs";
import { HealthConditionEffect } from "./_module.mjs";
import Persistable from "./persistable.mjs";
import Modifier from "./modifier.mjs";
import DamageAndType from "./skill/damage-and-type.mjs";

/**
 * Represents a graded effect, usually comprised of three sets of data, 
 * each representing an effect tied to a threshold. 
 * 
 * For example, this can be used to represent the damage gradings based 
 * on the number of Hits an attacker achieved. 
 * 
 * The combination of `comparison`, `threshold` and `comparisonTarget` 
 * results in the grading. For example "greater or equal to 3 Hits":
 * `comparison: COMPARISON_TYPES.greater_equals`, `threshold: 3`, 
 * `comparisonTarget: hit`
 * 
 * @property {ComparisonType} comparison 
 * @property {Number} threshold 
 * @property {String} comparisonTarget Any at-referencable target. 
 * E. g. `"hit"` or `"agility"`
 * @property {String | null} unstructured Free form text that may represent 
 * any effect, but without program support. 
 * @property {Array<HealthConditionEffect>} conditions Health Conditions 
 * that will be applied by this effect. 
 * @property {Array<DamageAndType>} damages Damage that will be applied 
 * by this effect. 
 * @property {Array<Modifier>} modifiers Fire-and-forget modifiers that 
 * will be applied by this effect. 
 * 
 * @extends Persistable
 */
export default class GradedEffect extends Persistable {
  /** @override */
  static fromDto(dto) {
    return new GradedEffect({
      comparison: COMPARISON_TYPES[dto.comparison],
      threshold: dto.threshold,
      comparisonTarget: dto.comparisonTarget,
      effect: dto.effect,
      unstructured: dto.unstructured,
      conditions: dto.conditions.map(it => HealthConditionEffect.fromDto(it)),
      damages: dto.damages.map(it => DamageAndType.fromDto(it)),
      modifiers: dto.modifiers.map(it => Modifier.fromDto(it)),
    });
  }

  /**
   * @param {Object} args 
   * @param {ComparisonType} args.comparison 
   * @param {Number} args.threshold 
   * @param {String} args.comparisonTarget 
   * E. g. `"hit"` or `"agility"`
   * @param {String | undefined} args.unstructured Free form text that may represent 
   * any effect, but without program support. 
   * @param {Array<HealthConditionEffect> | undefined} args.conditions Health Conditions 
   * that will be applied by this effect. 
   * @param {Array<DamageAndType> | undefined} args.damages Damage that will be applied 
   * by this effect. 
   * @param {Array<Modifier> | undefined} args.modifiers Fire-and-forget modifiers that 
   * will be applied by this effect. 
   */
  constructor(args = {}) {
    super(args);
    
    this.comparison = args.comparison;
    this.threshold = args.threshold;
    this.comparisonTarget = args.comparisonTarget;

    this.unstructured = args.unstructured ?? null;
    this.conditions = args.conditions ?? [];
    this.damages = args.damages ?? [];
    this.modifiers = args.modifiers ?? [];
  }

  /** @override */
  toDto() {
    return {
      comparison: this.comparison.name,
      threshold: this.threshold,
      comparisonTarget: this.comparisonTarget,
      effect: this.effect,
      unstructured: this.unstructured,
      conditions: this.conditions.map(it => it.toDto()),
      damages: this.damages.map(it => it.toDto()),
      modifiers: this.modifiers.map(it => it.toDto()),
    };
  }
}
