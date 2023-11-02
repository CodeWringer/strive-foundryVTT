/**
 * Represents a layout relative sizing. 
 * 
 * @property {String} width Layout width, in grid 
 * compliant unit. E. g. `"1fr"`
 * * default `"1fr"` 
 * @property {String} height Layout height, in grid 
 * compliant unit. E. g. `"1fr"`
 * * default `"1fr"` 
 */
export default class LayoutSize {
  /**
   * @param {Object} args 
   * @param {String} args.width Layout width, in grid 
   * compliant unit. E. g. `"1fr"`
   * * default `"1fr"` 
   * @param {String} args.height Layout height, in grid 
   * compliant unit. E. g. `"1fr"`
   * * default `"1fr"` 
   */
  constructor(args = {}) {
    this.width = args.width ?? "1fr";
    this.height = args.height ?? "1fr";
  }
}
