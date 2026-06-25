import Persistable from "./persistable.mjs";

/**
 * Represents a log entry of an advancement change. 
 * 
 * @property {Number} amount 
 * @property {String} date Real world or in-game date, if possible. 
 * @property {String} reason The localized reason of the change. 
 * E. g. being awarded XP or spending XP on advancing an Attribute. 
 */
export default class AdvancementHistoryEntry extends Persistable {
  /** @override */
  static fromDto(dto) {
    return new AdvancementHistoryEntry({
      amount: dto.amount,
      date: dto.date,
      reason: dto.reason,
    });
  }

  /**
   * @param {Object} args 
   * @param {Number | undefined} args.amount 
   * @param {String | undefined} args.date 
   * @param {String | undefined} args.reason 
   */
  constructor(args = {}) {
    super(args);
    
    this.amount = args.amount ?? 0;
    this.date = args.date ?? "";
    this.reason = args.reason ?? "";
  }

  /** @override */
  toDto() {
    return {
      amount: this.amount,
      date: this.date,
      reason: this.reason,
    };
  }
}
