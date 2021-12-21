import { createUUID } from "../utils/uuid-utility.mjs";

/**
 * Represents a layoutable component of a {LayoutContainer}. 
 */
export default class Containable {
  /**
   * Internal id of the containable. 
   * @type {String}
   * @private
   */
  _id = createUUID();

  /**
   * @type {LayoutContainer}
   * @private
   */
  _parent = undefined;
  get parent() { return this._parent; }

  _x = 0;
  get x() { return this._x; }
  set x(value) {
    this._x = value;
  }
  
  _y = 0;
  get y() { return this._y; }
  set y(value) {
    this._y = value;
  }
  
  _w = 0;
  get width() { return this._w; }
  set width(value) {
    this._w = value;
  }
  
  _h = 0;
  get height() { return this._h; }
  set height(value) {
    this._h = value;
  }
  
  _fill = false;
  /**
   * Indicates whether this {Containable} should fill the remaining space 
   * of its parent. 
   * @type {Boolean}
   */
  get fill() { return this._fill; }
  /**
   * @param {Boolean} value Sets whether this {Containable} should fill the remaining space 
   * of its parent. 
   */
  set fill(value) {
    this._fill = value;
  }
}
