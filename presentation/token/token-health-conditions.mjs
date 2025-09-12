import { ACTOR_TYPES } from "../../business/document/actor/actor-types.mjs";
import { ValidationUtil } from "../../business/util/validation-utility.mjs";
import { PixiLoader } from "../pixi/pixi-preloader.mjs";
import TokenExtender from "./token-extender.mjs";

export default class TokenHealthConditions extends TokenExtender {
  /**
   * @constant
   * @private
   */
  ICON_SIZE_DEFAULT = {
    width: 24,
    height: 24,
  };

  /**
   * @constant
   * @private
   */
  ICON_SIZE_HOVER = {
    width: 48,
    height: 48,
  };

  /**
   * @constant
   * @private
   */
  MARGIN = 5;

  /** @override */
  hoverOn(token) {
    if (token.actor.type === ACTOR_TYPES.PLAIN) return;
    this._addHoverTo(token);
  }

  /** @override */
  hoverOff(token) {
    if (token.actor.type === ACTOR_TYPES.PLAIN) return;
    this._removeHoverFrom(token);
  }

  /** @override */
  async updateOn(token) {
    if (token.actor.type === ACTOR_TYPES.PLAIN) return;

    this._removeStaticFrom(token);
    this._addStaticTo(token);
  }

  /**
   * Removes the static (= non-hover) elements. 
   * 
   * @param {Token} token 
   * 
   * @private
   */
  _removeStaticFrom(token) {
    if (ValidationUtil.isDefined(token.healthConditionContainer)) {
      token.removeChild(token.healthConditionContainer);
      token.healthConditionContainer = undefined;
    }
  }

  /**
   * Adds the static (= non-hover) elements. 
   * 
   * @param {Token} token 
   * 
   * @private
   */
  async _addStaticTo(token) {
    const transientActor = token.actor.getTransientObject();

    if (ValidationUtil.isDefined(token.healthConditionContainer)) return;
    if (ValidationUtil.isDefined(token.healthConditionHoverContainer)) return;

    // Root container
    token.healthConditionContainer = new PIXI.Container();
    token.addChild(token.healthConditionContainer);

    const scale = this.getScale(token);
    const textScale = 0.8 * scale; // Magic constant seems a good default text scale. 
    const style = token._getTextStyle();
    let x = 0;
    let y = -(this.ICON_SIZE_DEFAULT.height * scale);
    for await (const healthCondition of transientActor.health.states) {
      if (ValidationUtil.isDefined(healthCondition.iconTextureUrl)) {
        const container = new PIXI.Container();
        let xInContainer = 0;

        if (healthCondition.limit !== 1) {
          // Intensity
          const text = new PreciseText(healthCondition.intensity, style);
          text.scale.set(textScale, textScale);
          text.position.set(
            0,
            ((this.ICON_SIZE_DEFAULT.height * scale) - text.height) / 2
          );
          container.text = text;
          container.addChild(text);

          xInContainer += text.width;
        }

        // Icon
        const texture = await PixiLoader.load(healthCondition.iconTextureUrl);
        const sprite = new PIXI.Sprite(texture);
        sprite.width = this.ICON_SIZE_DEFAULT.width * scale;
        sprite.height = this.ICON_SIZE_DEFAULT.height * scale;
        sprite.position.set(xInContainer, 0);
        container.icon = sprite;
        container.addChild(sprite);

        token.healthConditionContainer.addChild(container);
        container.position.set(x, y);
        
        x += container.width + this.MARGIN;
      } else {
        game.strive.logger.logWarn("Failed to load texture: texture undefined");
      }
    }
  }

  /**
   * Removes the hover elements. 
   * 
   * @param {Token} token 
   * 
   * @private
   */
  async _removeHoverFrom(token) {
    if (ValidationUtil.isDefined(token.healthConditionHoverContainer)) {
      token.removeChild(token.healthConditionHoverContainer);
      token.healthConditionHoverContainer = undefined;
    }
  }

  /**
   * Adds the hover elements. 
   * 
   * @param {Token} token 
   * 
   * @private
   */
  async _addHoverTo(token) {
    const transientActor = token.actor.getTransientObject();

    if (ValidationUtil.isDefined(token.healthConditionHoverContainer)) return;

    // Root container
    token.healthConditionHoverContainer = new PIXI.Container();
    token.addChild(token.healthConditionHoverContainer);

    const scale = this.getScale(token);
    const style = token._getTextStyle();
    const textScale = 1.2 * scale; // Magic constant seems a good default text scale. 
    let x = token.w;
    let y = token.h - (this.ICON_SIZE_HOVER.height * scale);
    for await (const healthCondition of transientActor.health.states) {
      if (ValidationUtil.isDefined(healthCondition.iconTextureUrl)) {
        const container = new PIXI.Container();
        let xInContainer = 0;

        // Icon
        const texture = await PixiLoader.load(healthCondition.iconTextureUrl);
        const sprite = new PIXI.Sprite(texture);
        sprite.width = this.ICON_SIZE_HOVER.width * scale;
        sprite.height = this.ICON_SIZE_HOVER.height * scale;
        sprite.position.set(xInContainer, 0);
        container.icon = sprite;
        container.addChild(sprite);

        token.healthConditionHoverContainer.addChild(container);
        container.position.set(x, y);
        xInContainer += sprite.width + this.MARGIN;
        
        if (healthCondition.limit !== 1) {
          // Intensity
          const text = new PreciseText(healthCondition.intensity, style);
          text.scale.set(textScale, textScale);
          text.position.set(
            xInContainer,
            ((this.ICON_SIZE_HOVER.height * scale) - text.height) / 2
          );
          container.text = text;
          container.addChild(text);

          xInContainer += text.width + this.MARGIN;
        }

        // Localized name
        const text = new PreciseText(game.i18n.localize(healthCondition.localizableName), style);
        text.scale.set(textScale, textScale);
        text.position.set(
          xInContainer,
          ((this.ICON_SIZE_HOVER.height * scale) - text.height) / 2
        );
        container.text = text;
        container.addChild(text);

        xInContainer += text.width + this.MARGIN;

        y -= container.height;
      } else {
        game.strive.logger.logWarn("Failed to load texture: texture undefined");
      }
    }
  }
}
