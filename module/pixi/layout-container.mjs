import Containable from "./containable.mjs";
import { DebugDrawStrategy } from "./containable.mjs";

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
  wrapped = new PIXI.Container();

  /**
   * @type {Array<LayoutContainer>}
   * @private
   */
  _children = [];
  get children() { return this._children; }
  
  get x() { return this._x; }
  set x(value) {
    this._x = value;
    this.wrapped.x = value;
  }
  
  get y() { return this._y; }
  set y(value) {
    this._y = value;
    this.wrapped.y = value;
  }

  // TODO: Implement a means of defining min and max dimensions. 
  // _minWidth = undefined;
  // get minWidth() { return this._minWidth; }
  // set minWidth(value) {
  //   if (value !== undefined) {
  //     value = Math.max(0, value);

  //     if (this._maxWidth !== undefined) {
  //       this._maxWidth = Math.max(value, this._maxWidth);
  //     }
  //   }
  //   this._minWidth = value;

  //   this.refreshLayout();
  //   if (this.parent !== undefined) {
  //     this.parent.refreshLayout();
  //   }
  // }
  
  // _maxWidth = undefined;
  // get maxWidth() { return this._maxWidth; }
  // set maxWidth(value) {
  //   if (value !== undefined) {
  //     if (this.minWidth !== undefined) {
  //       value = Math.max(this.minWidth, value);
  //     } else {
  //       value = Math.max(0, value);
  //     }
  //   }
  //   this._maxWidth = value;

  //   this.refreshLayout();
  //   if (this.parent !== undefined) {
  //     this.parent.refreshLayout();
  //   }
  // }
  
  // _minHeight = undefined;
  // get minHeight() { return this._minHeight; }
  // set minHeight(value) {
  //   if (value !== undefined) {
  //     value = Math.max(0, value);

  //     if (this._maxHeight !== undefined) {
  //       this._maxHeight = Math.max(value, this._maxHeight);
  //     }
  //   }
  //   this._minHeight = value;

  //   this.refreshLayout();
  //   if (this.parent !== undefined) {
  //     this.parent.refreshLayout();
  //   }
  // }
  
  // _maxHeight = undefined;
  // get maxHeight() { return this._maxHeight; }
  // set maxHeight(value) {
  //   if (value !== undefined) {
  //     if (this.minHeight !== undefined) {
  //       value = Math.max(this.minHeight, value);
  //     } else {
  //       value = Math.max(0, value);
  //     }
  //   }
  //   this._maxHeight = value;

  //   this.refreshLayout();
  //   if (this.parent !== undefined) {
  //     this.parent.refreshLayout();
  //   }
  // }

  get width() { return this._w; }
  set width(value) {
    this._w = value;
    this.refreshLayout();
  }

  get height() { return this._h; }
  set height(value) {
    this._h = value;
    this.refreshLayout();
  }

  get alpha() { return this.wrapped.alpha; }
  set alpha(value) { this.wrapped.alpha = value; }

  constructor(pixiApp) {
    super(pixiApp);
    this._debugDrawStrategy = new LayoutContainerDebugDrawStrategy(pixiApp, this);
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

    if (child.wrapped !== undefined) {
      this.wrapped.addChild(child.wrapped);
    }

    this.refreshLayout();

    return true;
  }
  
  addChildAt(child, index) {
    if (this.hasChild(child)) return false;

    this.children.splice(index, 0, child);
    child._parent = this;

    if (child.wrapped !== undefined) {
      this.wrapped.addChild(child.wrapped);
    }

    this.refreshLayout();
    
    return true;
  }

  removeChild(child) {
    const index = this.indexOf(child);
    if (index < 0) return false;

    this.children.splice(index, 1);
    child.parent = undefined;

    if (child.wrapped !== undefined) {
      this.wrapped.removeChild(child.wrapped);
    }

    this.refreshLayout();

    return true;
  }
  
  clearChildren() {
    for (const child of this.children) {
      child.parent = undefined;
      
      if (child.wrapped !== undefined) {
        this.wrapped.removeChild(child.wrapped);
      }
    }
    this._children = [];
  }

  destroy() {
    this.debugDraw = false;
    
    if (this.parent !== undefined) {
      this.parent.removeChild(this);
    }
    this.clearChildren();
    this.wrapped.destroy();
    this.wrapped = undefined;
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

export class LayoutContainerDebugDrawStrategy extends DebugDrawStrategy {
  constructor(pixiApp, containable) {
    super(pixiApp, containable);
  }

  show() {
    super.show();

    for (const child of this._containable.children) {
      child.drawDebug = true;
    }
  }
  
  hide() {
    super.hide();

    for (const child of this._containable.children) {
      child.drawDebug = false;
    }
  }
}
