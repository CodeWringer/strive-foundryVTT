import { Vector2D } from "../vector.mjs";
import { Interpolator, InterpolationEvents } from "./interpolator.mjs";

export class PositionInterpolator extends Interpolator {
  /**
   * Interpolation duration. 
   * @type {Number}
   * @private
   */
  _duration = 0;
  
  /**
   * Current interpolation duration. 
   * 
   * Reset when initial or target are changed. 
   * @type {Number}
   * @private
   */
  _elapsed = 0;
  
  /**
   * Indicates whether the current interpolation has completed. 
   * 
   * Reset when initial or target are changed. 
   * @type {Boolean}
   * @private
   */
  _matched = false;

  /**
   * Initial position, in pixels. 
   * @type {Object} { x: {Number}, y: {Number}}
   * @private
   */
  _initial = { x: 0, y: 0 };
  /**
   * Initial position, in pixels. 
   * @type {Object} { x: {Number}, y: {Number}}
   */
  get initial() { return this._initial; }
  /**
   * Sets the current pixel coordinates. 
   * @param {Object} value { x: {Number}, y: {Number}}
   */
  set initial(value) {
    this._matched = false;
    this._elapsed = 0;

    this._initial.x = value.x;
    this._initial.y = value.y;
    
    this._current.x = value.x;
    this._current.y = value.y;

    this._interpolated.x = value.x;
    this._interpolated.y = value.y;
  }

  /**
   * Current position, in pixels. 
   * @type {Object} { x: {Number}, y: {Number}}
   * @private
   */
  _current = { x: 0, y: 0 };
  /**
   * Returns the current pixel coordinates. 
   * @type {Object} { x: {Number}, y: {Number}}
   */
  get current() { return this._current; }
  
  /**
   * In pixels. 
   * @type {Object} { x: {Number}, y: {Number}}
   * @private
   */
  _target = { x: 0, y: 0 };
  /**
   * Returns the target pixel coordinates. 
   * @type {Object} { x: {Number}, y: {Number}}
   */
  get target() { return this._target; }
  /**
   * Sets the target pixel coordinates. 
   * @param {Object} value { x: {Number}, y: {Number}}
   */
  set target(value) {
    this._matched = false;
    this._elapsed = 0;

    this._target.x = value.x;
    this._target.y = value.y;
  }
  
  /**
   * Sets up a new interpolation which immediately begins interpolating the position 
   * of the given object. 
   * @param {PIXI.DisplayObject} interpolated 
   * @param {PIXI.Application} pixiApp 
   * @param {Object} initial Initial position. 
   * @param {Object} target Target position. 
   * @param {Number} duration In milliseconds, how long this interpolation should take to complete. 
   *        Default 1000.
   */
  constructor(interpolated, pixiApp, initial, target, duration = 1000) {
    super(interpolated, pixiApp);

    this._initial = initial;
    this._target = target;
    this._duration = duration;
  }

  /**
   * @private
   * @override
   */
  _loop() {
    const deltaTime = super._loop();
    const pos = this._getPositionAtTime(this._elapsed);

    if (this._elapsed >= this._duration) {
      if (this._matched !== true) {
        this._matched = true;
        this._eventEmitter.emit(InterpolationEvents.completed);
      }
    } else {
      this._elapsed += deltaTime;
    }

    this._current.x = pos.x;
    this._current.y = pos.y;
    
    this._interpolated.x = this._current.x;
    this._interpolated.y = this._current.y;
  }

  /**
   * 
   * @param {Number} elapsed Milliseconds since interpolation start. 
   * @returns {Object} { x: {Number}, y: {Number} }
   */
  _getPositionAtTime(elapsed) {
    const fraction = elapsed / this._duration;

    if (fraction > 1.0) {
      return this.target;
    } else {
      let vectorDelta = new Vector2D(
        this.target.x - this.initial.x,
        this.target.y - this.initial.y
      );
      const magnitude = vectorDelta.getMagnitude() * fraction;
      const normalized = vectorDelta.getNormalized().multiply(magnitude);
      
      return new Vector2D(
        this.initial.x + normalized.x,
        this.initial.y + normalized.y
      );
    }
  }
}
