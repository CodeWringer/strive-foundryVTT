import { common } from "../../../common/_module.mjs";
import { PIXI_GLOBALS } from "./pixi-globals.mjs";

/**
 * Represents a clickable sprite, with hover state. 
 */
export default class PixiButton {
  /**
   * A blurred version of the icon sprite displayed beneath the icon sprite. 
   * 
   * @type {PIXI.Sprite}
   * @private
   */
  _spriteHover = undefined;

  /**
   * The actual icon sprite. 
   * 
   * @type {PIXI.Sprite}
   */
  _sprite = undefined;

  /**
   * Contains both sprites and is the central element to add as a child to make 
   * the button visible. 
   * 
   * @type {PIXI.Container}
   */
  container = undefined;

  get _hoverSpriteScale() { return 1.4; }

  get x() { return this._sprite.x; }
  set x(value) {
    this._sprite.x = value;
    this._spriteHover.x = (this._sprite.width - this._spriteHover.width) / 2;
  }

  get y() { return this._sprite.y; }
  set y(value) {
    this._sprite.y = value;
    this._spriteHover.y = (this._sprite.height - this._spriteHover.height) / 2;
  }

  get width() { return this._sprite.width; }
  set width(value) {
    this._sprite.width = value;
    this._spriteHover.width = value * this._hoverSpriteScale;
    this._updateSpriteHoverPosition();
  }

  get height() { return this._sprite.height; }
  set height(value) {
    this._sprite.height = value;
    this._spriteHover.height = value * this._hoverSpriteScale;
    this._updateSpriteHoverPosition();
  }

  get position() {
    const thiz = this;
    return {
      x: thiz.x,
      y: thiz.y,
      set: function (x, y) {
        thiz._sprite.x = x;
        thiz._sprite.y = y;
        thiz._updateSpriteHoverPosition();
      },
    };
  }

  /**
   * @param {Object} args
   * @param {PIXI.Texture} args.texture The texture of the button. 
   * @param {Function | undefined} args.onClick Callback that is invoked upon click. 
   */
  constructor(args = {}) {
    common.util.validation.validateOrThrow(args, ["texture"]);

    this.onClick = args.onClick ?? (() => { });

    this.container = new PIXI.Container();

    // Actual sprite. 
    this._sprite = new PIXI.Sprite(args.texture);

    if (PIXI_GLOBALS.PIXI_VERSION.greater(PIXI_GLOBALS.FOUNDRY_10_PIXI_VERSION)) {
      this._sprite.eventMode = "static";
    } else {
      this._sprite.interactive = true;
    }
    this._sprite.cursor = "pointer";

    // Hover sprite. 
    this._spriteHover = new PIXI.Sprite(args.texture);
    this._updateSpriteHoverSize();
    this._spriteHover.position.set(
      (this._sprite.width - this._spriteHover.width) / 2,
      (this._sprite.height - this._spriteHover.height) / 2
    );
    this._spriteHover.tint = 0xd23d3d;
    this._spriteHover.alpha = 0.0;
    const blurStrength = 4;
    const blurQuality = 4;
    this._spriteHover.filters = [
      new PIXI.BlurFilter(blurStrength, blurQuality)
    ];

    this.container.addChild(this._spriteHover);
    this.container.addChild(this._sprite);

    this._sprite.on("click", (event) => {
      this.onClick();
    })
    .on("pointerover", (event) => {
      this._spriteHover.alpha = 0.8;
    })
    .on("pointerout", (event) => {
      this._spriteHover.alpha = 0.0;
    });
  }
  
  /**
   * Updates the hover sprite's position to be centered on the sprite. 
   * 
   * @private
   */
  _updateSpriteHoverPosition() {
    this._spriteHover.position.set(
      this._sprite.x + ((this._sprite.width - this._spriteHover.width) / 2),
      this._sprite.y + ((this._sprite.height - this._spriteHover.height) / 2)
    );
  }
  
  /**
   * Updates the hover sprite's size, relative to the actual sprite's size. 
   * 
   * @private
   */
  _updateSpriteHoverSize() {
    this._spriteHover.width = this._sprite.width * this._hoverSpriteScale;
    this._spriteHover.height = this._sprite.height * this._hoverSpriteScale;
  }

}