import { HealthState } from "./health-states.mjs";

/**
 * Represents a character health state. 
 * 
 * @property {String} name Internal name. 
 * @property {String | undefined} localizableName Localization key. 
 * @property {String | undefined} localizableToolTip Localizable tool tip text. 
 * @property {String | undefined} icon CSS class of an icon. 
 * * E. g. `"fas fa-virus"`
 * @property {Number} limit A limit on how many times this health state may be incurred. 
 * * `0` implies there is no limit. 
 * * Minimum is `0`.
 * @property {Number} intensity The current value. 
 * * Minimum is `1`.
*/
export class CharacterHealthState extends HealthState {
  /**
   * @private
   */
  _intensity = 0;
  get intensity() { return this._intensity; }
  set intensity(value) {
    this._intensity = Math.max(value, 1);
  }

  /**
   * @param {Object} args
   * @param {String} args.name Internal name. 
   * @param {String | undefined} args.localizableName Localization key. 
   * @param {String | undefined} args.localizableToolTip Localizable tool tip text. 
   * @param {String | undefined} args.icon CSS class of an icon. 
   * * E. g. `"fas fa-virus"`
   * @param {Number | undefined} args.limit A limit on how many times this health state may be incurred. 
   * * `0` implies there is no limit. 
   * * Default `0`.
   * * Negative values are clamped to `0`.
   * @param {Number | undefined} args.intensity The current value. 
   * * Negative values and `0` are clamped to `1`.
   * * Default `1`.
   */
  constructor(args = {}) {
    super(args);

    this._intensity = args.intensity ?? 1;
  }
}