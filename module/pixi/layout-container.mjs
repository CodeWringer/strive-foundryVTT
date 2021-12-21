import { createUUID } from "../utils/uuid-utility.mjs";

// TODO: Scrollbar when content exceeds height?
// TODO: Scrollbar when content exceeds width?
/**
 * Wraps a {PIXI.Container} and adds a layouting layer to it. 
 * 
 * This class is supposed to be extended and its layout() method overridden 
 * to implement the actual layouting-logic. Instances of this class 
 * don't have any layout-logic. 
 * @abstract
 */
export default class LayoutContainer {
  /**
   * Internal id of the container. 
   * @type {String}
   * @private
   */
  _id = createUUID();

  /**
   * The wrapped {PIXI.Container}. 
   * @type {PIXI.Container}
   */
  container = new PIXI.Container();

  /**
   * @type {LayoutContainer}
   * @private
   */
  _parent = undefined;
  get parent() { return this._parent; }

  /**
   * @type {Array<LayoutContainer>}
   * @private
   */
  _children = [];
  get children() { return this._children; }

  /**
   * @type {Number}
   * @private
   */
  _x = 0;
  get x() { return this._x; }
  set x(value) {
    this._x = value;
    this.container.x = value;
  }

  _y = 0;
  get y() { return this._y; }
  set y(value) {
    this._y = value;
    this.container.y = value;
  }

  _w = 0;
  get width() { return this._w; }
  set width(value) {
    this._w = value;
    this.container.width = value;
    this.refreshLayout();
  }

  _h = 0;
  get height() { return this._h; }
  set height(value) {
    this._h = value;
    this.container.height = value;
    this.refreshLayout();
  }

  _fill = false;
  /**
   * Indicates whether this {LayoutContainer} should fill the remaining space 
   * of its parent. 
   * @type {Boolean}
   */
  get fill() { return this._fill; }
  /**
   * @param {Boolean} value Sets whether this {LayoutContainer} should fill the remaining space 
   * of its parent. 
   */
  set fill(value) {
    this._fill = value;
    
    if (this.parent === undefined) return;

    this.parent.refreshLayout();
  }

  hasChild(child) {
    return this.children.find((element) => { return element._id === child._id }) === true;
  }

  indexOf(child) {
    for (let i = 0; i < this.children.length; i++) {
      if (child._id === this.children[i]._id) {
        return i;
      }
    }
    return -1;
  }

  addChild(child) {
    if (this.hasChild(child)) return false;
    
    this._children.push(child);
    this.container.addChild(child.container);
    child._parent = this;


    this.refreshLayout();

    return true;
  }
  
  addChildAt(child, index) {
    if (this.hasChild(child)) return false;

    this.children.splice(index, 0, child);
    
    this.refreshLayout();
    
    return true;
  }

  removeChild(child) {
    const index = this.indexOf(child);
    if (index < 0) return false;

    this.children.splice(index, 1);
    child.parent = undefined;
    this.container.removeChild(child.container);

    this.refreshLayout();

    return true;
  }
  
  clearChildren() {
    for (const child of this.children) {
      this.container.removeChild(child.container);
      child.parent = undefined;
    }
    this._children = [];
  }

  destroy() {
    if (this.parent !== undefined) {
      this.parent.removeChild(this);
    }
    this.container.destroy();
  }

  /**
   * Layouts the children according to the layout scheme of this {LayoutContainer}. 
   * Must be implemented by inheriting types. 
   * @virtual
   */
  refreshLayout() {
    console.warn("Not implemented");
  }
}