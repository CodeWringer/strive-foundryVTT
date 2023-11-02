import { TEMPLATES } from "../templatePreloader.mjs";
import Layoutable from "./layoutable.mjs";

/**
 * Orders its `content` in a row. 
 * 
 * @property {LayoutSize} layoutSize This element's preferred size in its 
 * parent layout. 
 * @property {String | undefined} cssClass A css class.  
 * 
 * @property {Array<Layoutable>} content 
 */
export class RowLayout extends Layoutable {
  /**
   * @param {Object} args 
   * @param {LayoutSize | undefined} args.layoutSize 
   * @param {String | undefined} args.cssClass A css class to 
   * associate with the row.  
   * 
   * @param {Array<Layoutable> | undefined} args.content 
   */
  constructor(args = {}) {
    super({
      ...args,
      template: TEMPLATES.LAYOUT,
    });

    this.content = args.content ?? [];
  }

  /** @override */
  getViewModel(parent) {
    return new LayoutViewModel({
      parent: parent,
      style: `display: grid; grid-template-rows: ${this._getRowSizes(args.content)}`,
    });
  }

  /**
   * Returns the styling rules for the grid row sizes. 
   * 
   * @param {Array<Layoutable>} content 
   * 
   * @returns {String} The styling, e. g. `"1fr 32px 1fr"`
   * 
   * @private
   */
  _getRowSizes(content) {
    return content
    .map(it => it.layoutSize.height)
    .join(" ");
  }
}

/**
 * Orders its `content` in a column. 
 * 
 * @property {LayoutSize} layoutSize This element's preferred size in its 
 * parent layout. 
 * @property {String | undefined} cssClass A css class.  
 * 
 * @property {Array<Layoutable>} content 
 */
export class ColumnLayout extends Layoutable {
  /**
   * @param {Object} args 
   * @param {LayoutSize | undefined} args.layoutSize 
   * @param {String | undefined} args.cssClass A css class to 
   * associate with the column.  
   * 
   * @param {Array<Layoutable> | undefined} args.content 
   */
  constructor(args = {}) {
    super({
      ...args,
      template: TEMPLATES.LAYOUT,
    });

    this.content = args.content ?? [];
  }

  /** @override */
  getViewModel(parent) {
    return new LayoutViewModel({
      parent: parent,
      style: `display: grid; grid-template-columns: ${this._getColumnSizes(args.content)}`,
    });
  }

  /**
   * Returns the styling rules for the grid column sizes. 
   * 
   * @param {Array<Layoutable>} content 
   * 
   * @returns {String} The styling, e. g. `"1fr 32px 1fr"`
   * 
   * @private
   */
  _getColumnSizes(content) {
    return content
      .map(it => it.layoutSize.width)
      .join(" ");
  }
}
