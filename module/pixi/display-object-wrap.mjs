import Containable from "./containable.mjs";

export default class DisplayObjectWrap extends Containable {
  /**
   * @type {PIXI.DisplayObject|undefined}
   * @private
   */
  _toWrap = undefined;
  get wrapped() { return this._toWrap; }

  get x() { return this.wrapped.x; }
  set x(value) { this.wrapped.x = value; }
  
  get y() { return this.wrapped.y; }
  set y(value) { this.wrapped.y = value; }
  
  get width() { return this.wrapped.width; }
  set width(value) { this.wrapped.width = value; }
  
  get height() { return this.wrapped.height; }
  set height(value) { this.wrapped.height = value; }

  get alpha() { return this.wrapped.alpha; }
  set alpha(value) { this.wrapped.alpha = value; }

  constructor(toWrap) {
    super();

    if (toWrap === undefined) {
      throw "Parameter 'toWrap' must be defined!"
    }

    this._toWrap = toWrap;
  }
}