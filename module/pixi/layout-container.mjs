import Containable from "./containable.mjs";

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
export default class LayoutContainer extends Containable {
  /**
   * The wrapped {PIXI.Container}. 
   * @type {PIXI.Container}
   */
  pixiContainer = new PIXI.Container();

  /**
   * @type {Array<LayoutContainer>}
   * @private
   */
  _children = [];
  get children() { return this._children; }
  
  /** @override */
  get x() { return this._x; }
  /** @override */
  set x(value) {
    this._x = value;
    this.pixiContainer.x = value;
  }
  
  /** @override */
  get y() { return this._y; }
  /** @override */
  set y(value) {
    this._y = value;
    this.pixiContainer.y = value;
  }

  /** @override */
  get width() { return this._w; }
  /** @override */
  set width(value) {
    this._w = value;
    this.pixiContainer.width = value;
    this.refreshLayout();
  }
  
  /** @override */
  get height() { return this._h; }
  /** @override */
  set height(value) {
    this._h = value;
    this.pixiContainer.height = value;
    this.refreshLayout();
  }

  get contentBounds() {
    const dimensions = { width: 0, height: 0 };

    for (const child of this.children) {
      dimensions.width = Math.max(dimensions.width, child.width);
      dimensions.height = Math.max(dimensions.height, child.height);
    }

    return dimensions;
  }

  /**
   * @type {PIXI.Graphics}
   */
  _debugGraphics = undefined;

  get showDebug() { return this._debugGraphics !== undefined; }
  set showDebug(value) {
    if (value === true && this.showDebug !== true) {
      this._debugGraphics = new PIXI.Graphics();
      this._debugGraphics.lineStyle(2, 0xFF0000, 0.4, 0.0);
      this._debugGraphics.drawRect(0, 0, this.width, this.height);
      this.pixiContainer.addChild(this._debugGraphics);
    } else if (this._debugGraphics !== undefined) {
      this.pixiContainer.removeChild(this._debugGraphics);
      this._debugGraphics.destroy();
      this._debugGraphics = undefined;
    }
    for (const child of this.children) {
      if (child.showDebug !== undefined) {
        child.showDebug = value;
      } else if (this._debugGraphics !== undefined) {
        this._debugGraphics.lineStyle(2, 0x0000FF, 0.4, 0.0);
        this._debugGraphics.drawRect(child.x, child.y, child.width, child.height);
      }
    }
  }

  constructor() {
    super();
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
    child._parent = this;
    if (child.pixiContainer !== undefined) {
      this.pixiContainer.addChild(child.pixiContainer);
    } else if (child.wrapped !== undefined) {
      this.pixiContainer.addChild(child.wrapped);
    }

    this.refreshLayout();

    return true;
  }
  
  addChildAt(child, index) {
    if (this.hasChild(child)) return false;

    this.children.splice(index, 0, child);
    child._parent = this;
    if (child.pixiContainer !== undefined) {
      this.pixiContainer.addChild(child.pixiContainer);
    } else if (child.wrapped !== undefined) {
      this.pixiContainer.addChild(child.wrapped);
    }

    this.refreshLayout();
    
    return true;
  }

  removeChild(child) {
    const index = this.indexOf(child);
    if (index < 0) return false;

    this.children.splice(index, 1);
    child.parent = undefined;
    if (child.pixiContainer !== undefined) {
      this.pixiContainer.removeChild(child.pixiContainer);
    } else if (child.wrapped !== undefined) {
      this.pixiContainer.removeChild(child.wrapped);
    }

    this.refreshLayout();

    return true;
  }
  
  clearChildren() {
    for (const child of this.children) {
      child.parent = undefined;
      if (child.pixiContainer !== undefined) {
        this.pixiContainer.removeChild(child.pixiContainer);
      } else if (child.wrapped !== undefined) {
        this.pixiContainer.removeChild(child.wrapped);
      }
    }
    this._children = [];
  }

  destroy() {
    if (this.parent !== undefined) {
      this.parent.removeChild(this);
    }
    this.clearChildren();
    this.pixiContainer.destroy();
  }

  /**
   * Layouts the children according to the layout scheme of this {LayoutContainer}. 
   * Must be implemented by inheriting types. 
   * @abstract
   */
  refreshLayout() {
    console.warn("Not implemented");
  }
}