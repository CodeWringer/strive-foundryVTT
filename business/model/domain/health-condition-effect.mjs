import { common } from "../../../common/_module.mjs";
import Persistable from "./persistable.mjs";
import Reference from "./reference.mjs";

/**
 * Represents a Health Condition to be applied through programmatic means. 
 * 
 * @property {Reference} reference Reference to a Health Condition Item 
 * that is to be applied. 
 * @property {Number} severity The degree of the Health Condition to apply. 
 * 
 * @extends Persistable
 */
export default class HealthConditionEffect extends Persistable {
  /**
   * @param {Object} dto 
   * 
   * @returns {HealthConditionEffect}
   * 
   * @static
   * @override
   */
  static fromDto(dto) {
    return new HealthConditionEffect({
      reference: Reference.fromDto(dto.reference),
      severity: dto.severity,
    });
  }

  /**
   * @param {Object} args 
   * @param {Reference} args.reference Reference to a Health Condition Item 
   * that is to be applied. 
   * @param {Number | undefined} args.severity The degree of the Health Condition to apply. 
   */
  constructor(args = {}) {
    common.util.validation.validateOrThrow(args, ["reference"]);

    this.reference = args.reference;
    this.severity = args.severity ?? 0;
  }

  /** @override */
  toDto() {
    return {
      reference: this.reference.toDto(),
      severity: this.severity,
    };
  }
}
