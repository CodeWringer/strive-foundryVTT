import DynamicComponent from "../dynamic-component/dynamic-component.mjs";

/**
 * Declares a visual separator in a `List`. 
 * 
 * @property {Function} getIndex Invoked to determine the index where 
 * the separator is to be inserted. Must return a number! Receives no arguments. 
 * @property {DynamicComponent} separatorContent Determines the content 
 * that will be rendered in between list items. 
 * @property {ViewModelToolTipDefinition | undefined} tooltip
 */
export default class ListSeparator {
  /**
   * @param {Object} args 
   * @param {Function | undefined} args.getIndex Invoked to determine the index where 
   * the separator is to be inserted. Must return a number! Receives no arguments. 
   * @param {DynamicComponent | undefined} args.separatorContent Determines the content 
   * that will be rendered in between list items. 
   * @param {ViewModelToolTipDefinition | undefined} args.tooltip 
   * @param {Function | undefined} args.condition Invoked to determine whether this 
   * separator applies. Must return a boolean!
   */
  constructor(args = {}) {
    this._getIndex = args.getIndex ?? (() => 0);
    this._condition = args.condition ?? (() => true);
    this.separatorContent = args.separatorContent ?? new DynamicComponent({
      html: "",
    });
    this.tooltip = args.tooltip;
  }

  /**
   * Invoked to determine the index where the separator is to be inserted. 
   * @param {Number} maximum 
   * @returns {Number}
   */
  getIndex(maximum) {
    const r = parseInt(this._getIndex());
    return Math.min(Math.max(r, 0), maximum);
  }

  /**
   * Invoked to determine whether this separator applies. 
   * @returns {Boolean}
   */
  applies() {
    return this._condition() === true;
  }
}
