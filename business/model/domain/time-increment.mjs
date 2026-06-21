import { TIME_UNITS, TimeUnit } from "../const/time-units.mjs";
import DomainDataField from "./domain-data-field.mjs";

/**
 * Represents a Crafting Time Increment. 
 * 
 * @property {Number} value
 * @property {String} unit Must correspond to one of the `name` fields of the 
 * `TIME_UNITS` constants. 
 * 
 * @extends DomainDataField
*/
export default class TimeIncrement extends DomainDataField {
  /**
   * @param {Object} dto 
   * @param {Number} dto.value
   * @param {String} dto.unit Must correspond to one of the `name` fields of the 
   * `TIME_UNITS` constants. 
   * 
   * @returns {TimeIncrement}
   * 
   * @static
   * @override
   */
  static fromDto(dto) {
    return new TimeIncrement({
      value: value,
      unit: TIME_UNITS[dto.unit],
    });
  }

  /**
   * @param {Object} args 
   * @param {Number | undefined} args.value
   * @param {TimeUnit | undefined} args.unit
   */
  constructor(args = {}) {
    this.value = args.value ?? 0;
    this.unit = args.unit ?? TIME_UNITS.none;
  }

  /** @override */
  toDto() {
    return {
      value: this.value,
      unit: this.unit.name,
    };
  }
}
