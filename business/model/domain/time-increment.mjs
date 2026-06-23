import { TIME_UNITS, TimeUnit } from "../const/time-units.mjs";
import Persistable from "./persistable.mjs";

/**
 * Represents a Crafting Time Increment. 
 * 
 * @property {Number} value
 * @property {TimeUnit} unit 
 * 
 * @extends Persistable
*/
export default class TimeIncrement extends Persistable {
  /**
   * @param {Object} dto 
   * @param {Number} dto.value
   * @param {TimeUnit} dto.unit 
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
    super(args);
    
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
