import Containable from "./containable.mjs";

export class Button extends Containable {
  /**
   * A blurred version of the icon sprite displayed beneath the icon sprite. 
   * @type {PIXI.Sprite}
   * @private
   */
  _spriteHover = undefined;

  /**
   * Icon sprite. 
   * @type {PIXI.Sprite}
   * @private
   */
  _spriteIcon = undefined;

  /**
   * @type {PIXI.Container}
   * @private
   */
  _wrapped = undefined;
  get wrapped() { return this._wrapped; }

  /**
   * @type {Boolean}
   * @private
   */
  _disabled = false;
  /**
   * @type {Boolean}
   */
  get disabled() { return this._disabled; }
  /**
   * @param {Boolean} value
   */
  set disabled(value) {
    this._disabled = value;
    
    if (value === true) {
      this.showHover = false;
      this._spriteIcon.tint = 0x7F7F7F;
    } else {
      this._spriteIcon.tint = 0x000000;
    }
  }

  /**
   * @type {Boolean}
   * @private
   */
  _showHover = false;
  get showHover() { return this._showHover; }
  set showHover(value) {
    if (value === this._showHover) return;

    if (value === true && this.disabled !== true) {
      this._wrapped.addChildAt(this._spriteHover, 0);
    } else {
      this._wrapped.removeChild(this._spriteHover);
    }
    this._showHover = value;
  }

  /**
   * @type {Number}
   * @default 4
   * @private
   */
  _hoverPadding = 4;
  get hoverPadding() { return this._hoverPadding; }

  get x() { return this._wrapped.x; }
  set x(value) { this._wrapped.x = value; }

  get y() { return this._wrapped.y; }
  set y(value) { this._wrapped.y = value; }

  get width() { return this._w + this._padding.x; }
  set width(value) {
    this._w = value;
    this._spriteIcon.width = value;
    this._spriteIcon.x = this._w / 2;
    
    this._spriteHover.width = value + this._hoverPadding;
    this._spriteHover.x = this._w / 2;
  }

  get height() { return this._h + this._padding.y; }
  set height(value) {
    this._h = value;
    this._spriteIcon.height = value;
    this._spriteIcon.y = this._h / 2;
    
    this._spriteHover.height = value + this._hoverPadding;
    this._spriteHover.y = this._h / 2;
  }

  /**
   * Pads the width of this button, increasing the clickable area 
   * without affecting the dimensions of the sprites. 
   * @type {Object} { x: {Number}, y: {Number} }
   * @private
   */
  _padding = { x: 0, y: 0 };
  get padding() { return this._padding; }
  set padding(value) { this._padding = value; }

  /**
   * @type {Function}
   * @async
   */
  callback = async () => {};

  /**
   * If true, this button should only be clickable (and visible), 
   * if the current user has editing permissions. 
   * @type {Boolean}
   * @default true
   */
  requiresEditPermission = true;

  get visible() { return this._wrapped.visible; }
  set visible(value) { this._wrapped.visible = value; }

  /**
   * @param {PIXI.Texture} sprite 
   */
  constructor(pixiApp, texture, callback) {
    super(pixiApp);

    this.callback = callback;
    this._wrapped = new PIXI.Container();

    this._spriteIcon = new PIXI.Sprite.from(texture);
    this._spriteIcon.anchor.set(0.5);
    this._spriteIcon.tint = 0x000000;
    this._wrapped.addChild(this._spriteIcon);
    
    this._spriteHover = new PIXI.Sprite.from(texture);
    this._spriteHover.anchor.set(0.5);
    this._spriteHover.tint = 0xff0000;
    const blurStrength = 4;
    const blurQuality = 4;
    this._spriteHover.filters = [
      new PIXI.filters.BlurFilter(blurStrength, blurQuality)
    ];
  }
}