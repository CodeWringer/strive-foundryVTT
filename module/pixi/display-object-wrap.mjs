import Containable from "./containable.mjs";

export default class DisplayObjectWrap extends Containable {
  /**
   * @type {PIXI.DisplayObject|undefined}
   * @private
   */
  _toWrap = undefined;
  get wrapped() { return this._toWrap; }

  get x() { return this._toWrap !== undefined ? this._toWrap.x : this._x; }
  set x(value) {
    if (this._toWrap !== undefined) {
      this._toWrap.x = value;
    }
  }
  
  get y() { return this._toWrap !== undefined ? this._toWrap.y : this._y; }
  set y(value) {
    if (this._toWrap !== undefined) {
      this._toWrap.y = value;
    }
  }
  
  get width() { return this._toWrap !== undefined ? this._toWrap.width : this._w; }
  set width(value) {
    if (this._toWrap !== undefined) {
      this._toWrap.width = value;
    }
  }
  
  get height() { return this._toWrap !== undefined ? this._toWrap.height : this._h; }
  set height(value) {
    if (this._toWrap !== undefined) {
      this._toWrap.height = value;
    }
  }

  constructor(toWrap) {
    super();

    this._toWrap = toWrap;
  }
}