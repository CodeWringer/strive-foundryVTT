/**
 * Represents the abstract base class for any layout-includable 
 * type. 
 * 
 * @property {String | undefined} template Template path. 
 * @property {LayoutSize} layoutSize This element's preferred size 
 * in its parent layout. 
 * @property {String | undefined} cssClass A css class. 
 * 
 * @method getViewModel Returns a new view model instance that can 
 * present this instance. 
 * * abstract
 * 
 * @abstract
 */
export default class Layoutable {
  /**
   * @param {Object} args 
   * @param {String | undefined} args.template Template path. 
   * @param {LayoutSize | undefined} args.layoutSize This element's 
   * preferred size in its parent layout. 
   * @param {String | undefined} args.cssClass A css class. 
   */
  constructor(args = {}) {
    this.template = args.template;
    this.layoutSize = args.layoutSize ?? new LayoutSize();
    this.cssClass = args.cssClass;
  }

  /**
   * Returns a new view model instance that can present this instance. 
   * 
   * @param {ViewModel} parent Is a parent view model instance. 
   * This is expected to be the root view model instance of a 
   * dedicated sheet, list item or chat message. 
   * 
   * @returns {ViewModel} A new view model instance. 
   * 
   * @virtual
   */
  getViewModel(parent) {
    return undefined;
  }
}