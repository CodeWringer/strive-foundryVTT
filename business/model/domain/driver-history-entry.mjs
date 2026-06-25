import Persistable from "./persistable.mjs";

/**
 * Represents a log entry of a driver change. 
 * 
 * @property {Number} index 
 * @property {String} date Real world or in-game date, if possible. 
 * @property {String} oldValue Html content. 
 */
export default class DriverHistoryEntry extends Persistable {
  /** @override */
  static fromDto(dto) {
    return new DriverHistoryEntry({
      index: dto.index,
      date: dto.date,
      oldValue: dto.oldValue,
    });
  }

  /**
   * @param {Object} args 
   * @param {Number | undefined} args.index 
   * @param {String | undefined} args.date 
   * @param {String | undefined} args.oldValue 
   */
  constructor(args = {}) {
    super(args);
    
    this.index = args.index ?? 0;
    this.date = args.date ?? "";
    this.oldValue = args.oldValue ?? "";
  }

  /** @override */
  toDto() {
    return {
      index: this.index,
      date: this.date,
      oldValue: this.oldValue,
    };
  }
}
