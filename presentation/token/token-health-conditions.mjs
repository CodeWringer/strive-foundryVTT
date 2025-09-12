import { ACTOR_TYPES } from "../../business/document/actor/actor-types.mjs";
import { StringUtil } from "../../business/util/string-utility.mjs";
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
  
  /**
   * @constant
   * @private
   */
  MAX_STATIC_ICONS = 5;

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
    let y = 0;
    let entryCount = 0;
    for (let i = 0; i < Math.min(this.MAX_STATIC_ICONS + 1, transientActor.health.states.length); i++) {
      const healthCondition = transientActor.health.states[i];
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
        
        entryCount++;
        x += container.width + this.MARGIN;
        if (x >= token.w) {
          x = 0;
          y += container.height;
        }
      } else {
        game.strive.logger.logWarn("Failed to load texture: texture undefined");
      }
    }

    // Indicator that more hidden Conditions exist.
    if (entryCount === this.MAX_STATIC_ICONS && transientActor.health.states.length > this.MAX_STATIC_ICONS) {
      const localized = StringUtil.format2(game.i18n.localize("system.character.health.condition.tokenMore"), {
        moreCount: transientActor.health.states.length - entryCount,
      });
      const moreText = new PreciseText(localized, style);
      moreText.scale.set(textScale, textScale);
      moreText.position.set(x, y);
      token.healthConditionContainer.moreText = moreText;
      token.healthConditionContainer.addChild(moreText);
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
    let entriesInCurrentColumn = 0;
    let maxWidth = 0;
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

        maxWidth = Math.max(container.width, maxWidth);
        entriesInCurrentColumn++;
        if (entriesInCurrentColumn >= 10) {
          entriesInCurrentColumn = 0;
          x += maxWidth;
          maxWidth = 0;
          y = token.h - (this.ICON_SIZE_HOVER.height * scale);
        } else {
          y -= container.height;
        }
      } else {
        game.strive.logger.logWarn("Failed to load texture: texture undefined");
      }
    }
  }
}
