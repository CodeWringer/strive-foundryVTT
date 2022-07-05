import { ITEM_ORIENTATIONS } from "../../constants/item-orientations.mjs";
import { PositionInterpolator } from "../../pixi/interpolation/position-interpolator.mjs";
import { TEXTURES } from "../../pixi/texture-preloader.mjs";

/**
 * Represents the indicator of a dragging target location. 
 */
export class DragIndicator {
  /**
   * @type {PIXI.Application}
   * @private
   */
  _pixiApp = undefined;

  /**
   * The stage to draw to.
   * @type {PIXI.Container}
   * @private
   */
  _stage = undefined;

  /**
   * @type {PIXI.Graphics}
   * @private
   */
  _graphics = undefined;
  
  /**
   * @type {PIXI.Sprite}
   * @private
   */
  _spriteCross = undefined;

  /**
   * @type {PIXI.Container}
   * @private
   */
  _container = undefined;
  
  /**
   * The grid coordinates (not pixel coordinates) the indicator should be placed at, initially. 
   * @type {Object} { x: {Number}, y: {Number} }
   * @private
   */
  _initialOnGrid = { x: 0, y: 0 };
  /**
   * The grid coordinates (not pixel coordinates) the indicator should be placed at, initially. 
   * @type {Object} { x: {Number}, y: {Number} }
   */
  get initialOnGrid() { return this._initialOnGrid; }

  /**
   * The grid coordinates (not pixel coordinates) the indicator should arrive at. 
   * @type {Object} { x: {Number}, y: {Number} }
   * @private
   */
  _targetOnGrid = { x: 0, y: 0 };
  /**
   * The grid coordinates (not pixel coordinates) the indicator should arrive at. 
   * @type {Object} { x: {Number}, y: {Number} }
   */
  get targetOnGrid() { return this._targetOnGrid; }
  
  /**
   * Size of the indicator, in grid coordinates. 
   * @type {Object} { width: {Number}, height: {Number} }
   * @private
   */
  _sizeOnGrid = { width: 1, height: 1 };

  /**
   * @type {PositionInterpolator}
   * @private
   */
  _interpolator = undefined;

  /**
   * LineStyle to use for the drag indicator to show a placement is valid. 
   * @type {Object}
   * @private
   */
  _lineStyleValid = {
    width: 6,
    color: 0x00FF00,
    alpha: 0.7,
    alignment: 0.0
  };
  
  /**
   * LineStyle to use for the drag indicator to show a placement is invalid. 
   * @type {Object}
   * @private
   */
  _lineStyleInvalid = {
    width: 6,
    color: 0xFF0000,
    alpha: 0.7,
    alignment: 0.0
  };

  /**
   * Indicates the size of a grid tile. 
   * 
   * Treats tile shape as square. 
   * @type {Number}
   * @private
   */
  _tileSize = 0;

  /**
   * @type {Boolean}
   * @private
   */
  _show = false;
  /**
   * Returns whether the drag indicator is currently shown. 
   * @type {Boolean}
   */
  get show() { return this._show; }
  /**
   * Sets the visibility of the drag indicator. 
   * 
   * Make sure to call setTo() before showing and to set the coordinates to 
   * where the drag indicator should start being visible at. 
   * @param {Boolean} value The visibility of the drag indicator
   */
  set show(value) {
    if (value !== this.show) {
      if (value === true) {
        this._redraw();
        this._stage.addChild(this._container);
      } else {
        this._stage.removeChild(this._container);
      }
    }
    this._show = value;
  }

  /**
   * If true, indicates that the drag indicator should display as "valid".
   * @type {Boolean}
   * @private
   */
  _valid = false;
  /**
   * Returns whether the drag indicator currently displays as "valid". 
   * @type {Boolean}
   */
  get valid() { return this._valid; }
  /**
   * Sets whether the drag indicator currently displays as "valid". 
   * 
   * Changes **will** be respected, while the indicator is shown. 
   * @param {Boolean} value Whether to show as "valid". 
   */
  set valid(value) {
    const oldValue = this._valid;
    this._valid = value;
    if (value != oldValue) {
      this._redraw();
    }
  }

  /**
   * @type {CONFIG.itemOrientations}
   */
  orientation = undefined;

  constructor(pixiApp, tileSize) {
    this._pixiApp = pixiApp;
    this._stage = this._pixiApp.stage;
    this._tileSize = tileSize;
    this._graphics = new PIXI.Graphics();
    this._container = new PIXI.Container();
    this._container.addChild(this._graphics);
    this._spriteCross = new PIXI.Sprite.from(TEXTURES.CROSS);
    this._spriteCross.width = tileSize / 1.5;
    this._spriteCross.height = tileSize / 1.5;
    this._spriteCross.tint = 0x000000;

    this._interpolator = new PositionInterpolator(this._container, pixiApp, { x: 0, y: 0 }, { x: 0, y: 0 }, 150);
    this.valid = false;
  }

  destroy() {
    this.show = false;

    if (this._graphics !== undefined) {
      this._graphics.destroy();
    }
    this._graphics = undefined;

    if (this._container !== undefined) {
      this._container.destroy();
    }
    this._container = undefined;

    if (this._interpolator !== undefined) {
      this._interpolator.destroy();
    }
    this._interpolator = undefined;
  }

  /**
   * Sets the size of hte 
   * 
   * Changes will **not** be respected, while the indicator is shown. 
   * @param {Number} width Width of the indicator, in grid coordinates. 
   * @param {Number} height Height of the indicator, in grid coordinates. 
   * @param {CONFIG.itemOrientations} orientation The orientation that the given dimensions represents. 
   */
  setSize(width, height, orientation) {
    this._sizeOnGrid.width = width;
    this._sizeOnGrid.height = height;
    this.orientation = orientation;
  }

  /**
   * Sets the initial grid coordinates. 
   * 
   * Changes will **not** be respected, while the indicator is shown. 
   * @param {Number} gridX X coordinate, in grid coordinates.
   * @param {Number} gridY Y coordinate, in grid coordinates.
   */
  setInitialTo(gridX, gridY) {
    this._initialOnGrid.x = gridX;
    this._initialOnGrid.y = gridY;

    this._interpolator.initial = {
      x: this._initialOnGrid.x * this._tileSize,
      y: this._initialOnGrid.y * this._tileSize
    }
  }

  /**
   * Sets the target grid coordinates. 
   * 
   * Changes **will** be respected, while the indicator is shown. 
   * @param {Number} gridX X coordinate, in grid coordinates.
   * @param {Number} gridY Y coordinate, in grid coordinates.
   */
  setTargetTo(gridX, gridY) {
    if (this._targetOnGrid.x === gridX && this._targetOnGrid.y === gridY) return;

    this._targetOnGrid.x = gridX;
    this._targetOnGrid.y = gridY;

    this._interpolator.initial = {
      x: this._interpolator.current.x,
      y: this._interpolator.current.y
    }

    this._interpolator.target = {
      x: this._targetOnGrid.x * this._tileSize,
      y: this._targetOnGrid.y * this._tileSize
    }
  }

  /**
   * Rotates the target indicator. 
   */
  rotate() {
    if (this.orientation === ITEM_ORIENTATIONS.vertical) {
      this.orientation = ITEM_ORIENTATIONS.horizontal;
    } else if (this.orientation === ITEM_ORIENTATIONS.horizontal) {
      this.orientation = ITEM_ORIENTATIONS.vertical;
    }

    const width = this._sizeOnGrid.width;
    this._sizeOnGrid.width = this._sizeOnGrid.height;
    this._sizeOnGrid.height = width;

    this._redraw();
  }

  _redraw() {
    this._graphics.clear();

    if (this.valid === true) {
      this._graphics.lineStyle(this._lineStyleValid.width, this._lineStyleValid.color, this._lineStyleValid.alpha, this._lineStyleValid.alignment);
    } else {
      this._graphics.lineStyle(this._lineStyleInvalid.width, this._lineStyleInvalid.color, this._lineStyleInvalid.alpha, this._lineStyleInvalid.alignment);
    }

    const width = this._sizeOnGrid.width * this._tileSize;
    const height = this._sizeOnGrid.height * this._tileSize;

    this._graphics.drawRect(0, 0, width, height);

    if (this.valid === false) {
      this._spriteCross.x = (width / 2) - (this._spriteCross.width / 2);
      this._spriteCross.y = (height / 2) - (this._spriteCross.height / 2);
      this._container.addChild(this._spriteCross);
    } else {
      this._container.removeChild(this._spriteCross);
    }
  }
}