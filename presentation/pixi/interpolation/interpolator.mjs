import { EventEmitter } from "../../utils/event-emitter.mjs";

export const InterpolationEvents = {
  completed: "completed"
}

/**
 * @abstract
 */
export class Interpolator {
  /**
   * @type {PIXI.Application}
   * @private
   */
  _pixiApp = undefined;

  /**
   * The interpolated object. 
   * @type {PIXI.DisplayObject}
   * @private
   */
  _interpolated = undefined;

  /**
   * @type {EventEmitter}
   * @private
   */
  _eventEmitter = undefined;

  /**
   * @type {PIXI.Ticker}
   * @private
   */
  _ticker = undefined;

    /**
   * Sets up a new interpolation which immediately begins interpolating the position and dimensions 
   * of the given object. 
   * @param {PIXI.DisplayObject} interpolated 
   * @param {PIXI.Application} pixiApp 
   */
  constructor(interpolated, pixiApp) {
    this._interpolated = interpolated;
    this._pixiApp = pixiApp;

    this._eventEmitter = new EventEmitter();
    this._eventEmitter.bind(this);

    this._ticker = this._pixiApp.ticker.add(this._loop.bind(this));
  }

  /**
   * Destroys this {Interpolator}, by unhooking its events and {PIXI.Application} ticker. 
   * @virtual
   */
  destroy() {
    this._interpolated = undefined;
    if (this._pixiApp.ticker !== undefined && this._pixiApp.ticker !== null) {
      this._pixiApp.ticker.remove(this._loop);
    }
    this._pixiApp = undefined;
    this._eventEmitter.allOff(InterpolationEvents.completed);
    this._ticker = undefined;
  }

  /**
   * @private
   * @virtual
   * @returns {Number} Number of milliseconds since last frame. 
   */
  _loop() {
    return this._ticker.elapsedMS;
  }
}