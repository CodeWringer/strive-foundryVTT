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

  /**
   * @type {PIXI.Application}
   * @private
   */
  _pixiApp = undefined;

  /**
   * @type {DebugDrawStrategy}
   * @private
   */
  _debugDrawStrategy = undefined;

  _drawDebug = false;
  get drawDebug() { return this._drawDebug; }
  set drawDebug(value) {
    if (this._debugDrawStrategy !== undefined) {
      if (value) {
        this._debugDrawStrategy.show();
      } else {
        this._debugDrawStrategy.hide();
      }
    }
  }

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

  constructor(pixiApp) {
    this._pixiApp = pixiApp;
    this._debugDrawStrategy = new DebugDrawStrategy(pixiApp, this);
  }

  getGlobalCoordinates() {
    const coordinates = { x: this.x, y: this.y };

    if (this.parent !== undefined) {
      const parentCoordinates = this.parent.getGlobalCoordinates();
      coordinates.x += parentCoordinates.x;
      coordinates.y += parentCoordinates.y;
    }

    return coordinates;
  }
}

export class DebugDrawStrategy {
  /**
   * @type {PIXI.Graphics}
   * @private
   */
  _debugGraphics = undefined;

  /**
   * @type {PIXI.Application}
   * @private
   */
  _pixiApp = undefined;
  
  /**
   * @type {Containable}
   * @private
   */
  _containable = undefined;

  _lineStyle = {
    width: 2,
    color: 0xFF0000,
    alpha: 0.2,
    alignment: 0.0
  }

  constructor(pixiApp, containable) {
    this._pixiApp = pixiApp;
    this._containable = containable;
  }

  show() {
    if (this._debugGraphics !== undefined) return;
    
    this._debugGraphics = new PIXI.Graphics();
    this._debugGraphics.lineStyle(this._lineStyle.width, this._lineStyle.color, this._lineStyle.alpha, this._lineStyle.alignment);
    const coordinates = this._containable.getGlobalCoordinates();
    this._debugGraphics.drawRect(coordinates.x, coordinates.y, this._containable.width, this._containable.height);

    this._pixiApp.stage.addChild(this._debugGraphics);
  }
  
  hide() {
    if (this._debugGraphics === undefined) return;

    this._pixiApp.stage.removeChild(this._debugGraphics);
    this._debugGraphics.destroy();
    this._debugGraphics = undefined;
  }
}
