import { INJURY_SHRUG_OFF_STATES, InjuryShrugOffState } from "../const/injury-shrug-off-states.mjs";
import Persistable from "../persistable.mjs";

/**
 * Represents an injury shrug off. 
 * 
 * @property {InjuryShrugOffState} state 
 * @property {Number} threshold 
 * 
 * @extends Persistable
 */
export default class InjuryShrugOff extends Persistable {
  /**
   * @param {Object} dto 
   * 
   * @returns {InjuryShrugOff}
   * 
   * @static
   * @override
   */
  static fromDto(dto) {
    return new InjuryShrugOff({
      state: INJURY_SHRUG_OFF_STATES[dto.state],
      threshold: dto.threshold,
    });
  }

  /**
   * @param {Object} args 
   * @param {InjuryShrugOffState | undefined} args.state 
   * @param {Number | undefined} args.threshold 
   */
  constructor(args = {}) {
    super(args);
    
    this.state = args.state ?? INJURY_SHRUG_OFF_STATES.indeterminate;
    this.threshold = args.threshold ?? 0;
  }

  /** @override */
  toDto() {
    return {
      state: this.state.name,
      threshold: this.threshold,
    };
  }
}
