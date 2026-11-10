import Persistable from "./persistable.mjs";
import { COMPARISON_TYPES, ComparisonType } from "./const/comparison-types.mjs";
import { COMPARISON_TARGET_TYPES } from "./const/comparison-target-types.mjs";
import ComparisonTarget from "./comparison-target.mjs";
import Modifier from "./modifier.mjs";

/**
 * Represents a graded effect. 
 * 
 * @property {ComparisonType} comparisonType 
 * @property {Number} threshold 
 * @property {ComparisonTarget} comparisonTarget 
 * @property {String | null} unstructured Free form text that may represent 
 * any effect, but without program support. 
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
      comparisonTarget: ComparisonTarget.fromDto(dto.comparisonTarget),
      unstructured: dto.unstructured,
      modifiers: dto.modifiers.map(it => Modifier.fromDto(it)),
    });
  }

  /**
   * @type {ComparisonType}
   * @private
   */
  #comparisonType = null;
  get comparisonType() { return this.#comparisonType; }
  set comparisonType(value) {
    const old = this.#comparisonType;
    this.#comparisonType = value;
    this.onChange("comparisonType", value, old);
  }

  /**
   * @type {Number}
   * @private
   */
  #threshold = 0;
  get threshold() { return this.#threshold; }
  set threshold(value) {
    const old = this.#threshold;
    this.#threshold = value;
    this.onChange("threshold", value, old);
  }

  /**
   * @type {ComparisonTarget}
   * @private
   */
  #comparisonTarget = null;
  get comparisonTarget() { return this.#comparisonTarget; }
  set comparisonTarget(value) {
    const old = this.#comparisonTarget;
    this.#comparisonTarget = value;
    this.onChange("comparisonTarget", value, old);
  }

  /**
   * @type {String | null}
   * @private
   */
  #unstructured = null;
  get unstructured() { return this.#unstructured; }
  set unstructured(value) {
    const old = this.#unstructured;
    this.#unstructured = value;
    this.onChange("unstructured", value, old);
  }

  /**
   * @param {Object} args 
   * @param {ComparisonType | undefined} args.comparisonType 
   * @param {Number | undefined} args.threshold 
   * @param {ComparisonTarget | undefined} args.comparisonTarget 
   * @param {String | undefined} args.unstructured Free form text that may represent 
   * any effect, but without program support. 
   * @param {Array<Modifier> | undefined} args.modifiers Fire-and-forget modifiers that 
   * will be applied by this effect. 
   * @param {Function<void> | undefined} args.onChange Invoked when any property value changes. Arguments: 
   * * `fieldName: String` - Name of the field/property on this instance that was changed. 
   * * `newValue: Any` - Value after the change, and the current value. 
   * * `oldValue: Any` - Value prior to the change. 
   */
  constructor(args = {}) {
    super(args);
    
    this.#comparisonType = args.comparisonType ?? COMPARISON_TYPES.less_equals;
    this.#threshold = args.threshold ?? 0;
    this.#comparisonTarget = args.comparisonTarget ?? new ComparisonTarget({
      type: COMPARISON_TARGET_TYPES.hit,
    });
    this.#unstructured = args.unstructured ?? null;
    this.modifiers = args.modifiers ?? [];
    this.onChange = args.onChange ?? (() => {});
  }

  /** @override */
  toDto() {
    return {
      comparisonType: this.comparisonType.name,
      threshold: this.threshold,
      comparisonTarget: this.comparisonTarget.toDto(),
      unstructured: this.unstructured,
      modifiers: this.modifiers.map(it => it.toDto()),
    };
  }
}
