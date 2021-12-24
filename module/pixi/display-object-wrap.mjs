import Containable from "./containable.mjs";
import { DebugDrawStrategy } from "./containable.mjs";

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

  get tint() { return this.wrapped.tint; }
  set tint(value) { this.wrapped.tint = value; }

  constructor(toWrap, pixiApp) {
    super(pixiApp);

    if (toWrap === undefined) {
      throw "Parameter 'toWrap' must be defined!"
    }

    this._toWrap = toWrap;
    this._debugDrawStrategy = new DisplayObjectWrapDebugDrawStrategy(pixiApp, this);
  }
}

export class DisplayObjectWrapDebugDrawStrategy extends DebugDrawStrategy {
  constructor(pixiApp, containable) {
    super(pixiApp, containable);
    this._lineStyle.color = 0x0000FF;
  }

  show() {
    super.show();
  }
  
  hide() {
    super.hide();
  }
}
