import { validateOrThrow } from "../../business/util/validation-utility.mjs";
import { getPixiTexture } from "./pixi-preloader.mjs";

/**
 * Represents a clickable sprite, with hover state. 
 * 
 * @property {PIXI.Container} wrapped A wrapped `PIXI.Container` that contains both sprites. 
 * This object needs to be added to the stage to make the button visible. 
 * @property {Number} x 
 * @property {Number} y 
 * @property {Number} width 
 * @property {Number} height 
 */
export class PixiButton {
  /**
   * A blurred version of the icon sprite displayed beneath the icon sprite. 
   * 
   * @type {PIXI.Sprite}
   * @private
   */
  _spriteHover = undefined;

  /**
   * Icon sprite. 
   * 
   * @type {PIXI.Sprite}
   * @private
   */
  _spriteIcon = undefined;

  /**
   * A wrapped container that contains both sprites. 
   * 
   * @type {PIXI.Container}
   * @private
   */
  _wrapped = undefined;
  get wrapped() { return this._wrapped; }

  get x() { return this._wrapped.x; }
  set x(value) { this._wrapped.x = value; }

  get y() { return this._wrapped.y; }
  set y(value) { this._wrapped.y = value; }

  get width() { return this._wrapped.width; }
  set width(value) { this._wrapped.width = value; }

  get height() { return this._wrapped.height; }
  set height(value) { this._wrapped.height = value; }

  get position() { return this._wrapped.position; }

  /**
   * @param {Object} args
   * @param {PIXI.Texture} args.texture The texture of the button. 
   * @param {Function | undefined} args.onClick Callback that is invoked upon click. 
   */
  constructor(args = {}) {
    validateOrThrow(args, ["texture"]);

    this.onClick = args.onClick ?? (() => {});

    this._wrapped = new PIXI.Container();
    
    // Actual sprite. 
    this._spriteIcon = new PIXI.Sprite(args.texture);

    this._spriteIcon.eventMode = "static";
    this._spriteIcon.cursor = "pointer";
    
    // Hover sprite. 
    this._spriteHover = new PIXI.Sprite(args.texture);
    this._spriteHover.anchor.set(0.5, 0.5);
    this._spriteHover.position.set(this._spriteIcon.width / 2, this._spriteIcon.height / 2);
    this._spriteHover.scale.set(1.4, 1.4);
    this._spriteHover.tint = 0xd23d3d;
    this._spriteHover.alpha = 0.0;
    const blurStrength = 4;
    const blurQuality = 4;
    this._spriteHover.filters = [
      new PIXI.filters.BlurFilter(blurStrength, blurQuality)
    ];
    this._wrapped.addChild(this._spriteHover);
    this._wrapped.addChild(this._spriteIcon);

    this._spriteIcon.on("click", (event) => {
      this.onClick();
    })
    .on("pointerover", (event) => {
      this._spriteHover.alpha = 0.8;
    })
    .on("pointerout", (event) => {
      this._spriteHover.alpha = 0.0;
    });
  }
}