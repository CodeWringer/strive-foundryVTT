import { DebugDrawStrategy } from "./containable.mjs";
import LayoutContainer from "./layout-container.mjs";

/**
 * A simple container that adds padding to its inner bounds. 
 * 
 * Children will always be stretched to fit the padded interior bounds. 
 */
export default class MarginLayoutContainer extends LayoutContainer {
  padding = new MarginLayoutContainerPadding(this);

  get paddedRectangle() {
    return new PIXI.Rectangle(
      this.padding.left,
      this.padding.top,
      this.width - (this.padding.left + this.padding.right),
      this.height - (this.padding.top + this.padding.bottom)
    )
  }

  constructor(pixiApp) {
    super(pixiApp);

    this._debugDrawStrategy = new MarginLayoutContainerDebugDrawStrategy(pixiApp, this);
  }
  
  refreshLayout() {
    const paddedRectangle = this.paddedRectangle;

    for (const child of this.children) {
      child.x = paddedRectangle.x;
      child.y = paddedRectangle.y;
      child.width = paddedRectangle.width;
      child.height = paddedRectangle.height;

      if (child.refreshLayout !== undefined) {
        child.refreshLayout();
      }
    }
  }
}

class MarginLayoutContainerPadding {
  /**
   * @type {MarginLayoutContainer}
   */
  _owner = undefined;

  _top = 0;
  get top() { return this._top; }
  set top(value) {
    this._top = value;
    this._owner.refreshLayout();
  }

  _right = 0;
  get right() { return this._right; }
  set right(value) {
    this._right = value;
    this._owner.refreshLayout();
  }

  _bottom = 0;
  get bottom() { return this._bottom; }
  set bottom(value) {
    this._bottom = value;
    this._owner.refreshLayout();
  }

  _left = 0;
  get left() { return this._left; }
  set left(value) {
    this._left = value;
    this._owner.refreshLayout();
  }

  constructor(owner) {
    this._owner = owner;
  }
}

export class MarginLayoutContainerDebugDrawStrategy extends DebugDrawStrategy {
  constructor(pixiApp, containable) {
    super(pixiApp, containable);
  }

  show() {
    if (this._debugGraphics !== undefined) return;

    this._debugGraphics = new PIXI.Graphics();
    const coordinates = this._containable.getGlobalCoordinates();

    this._debugGraphics.beginFill(0x27C62D, 0.2);
    this._debugGraphics.drawRect(
      coordinates.x,
      coordinates.y,
      this._containable.width,
      this._containable.padding.top
    );
    this._debugGraphics.drawRect(
      coordinates.x,
      coordinates.y + this._containable.height - this._containable.padding.bottom,
      this._containable.width,
      this._containable.padding.bottom
    );
    this._debugGraphics.drawRect(
      coordinates.x,
      coordinates.y + this._containable.padding.top,
      this._containable.padding.left,
      this._containable.height - this._containable.padding.bottom
    );
    this._debugGraphics.drawRect(
      coordinates.x + this._containable.width - this._containable.padding.right,
      coordinates.y + this._containable.padding.top,
      this._containable.padding.right,
      this._containable.height - this._containable.padding.bottom
    );
    this._debugGraphics.endFill();
    
    this._debugGraphics.lineStyle(this._lineStyle.width, this._lineStyle.color, this._lineStyle.alpha, this._lineStyle.alignment);
    this._debugGraphics.drawRect(coordinates.x, coordinates.y, this._containable.width, this._containable.height);

    this._pixiApp.stage.addChild(this._debugGraphics);

    for (const child of this._containable.children) {
      child.drawDebug = true;
    }
  }

  hide() {
    if (this._debugGraphics === undefined) return;
    
    this._pixiApp.stage.removeChild(this._debugGraphics);
    this._debugGraphics.destroy();
    this._debugGraphics = undefined;

    for (const child of this._containable.children) {
      child.drawDebug = false;
    }
  }
}
