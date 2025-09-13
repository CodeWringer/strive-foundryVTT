import { ACTOR_TYPES } from "../../business/document/actor/actor-types.mjs";
import { CharacterHealthCondition } from "../../business/ruleset/health/character-health-state.mjs";
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

  /**
   * Flag that is only true while a call to `updateOn` is invoked and being executed. 
   * 
   * While this flag is true, any further calls to that method will immediately exit, 
   * hopefully preventing it running multiple times in parallel, which can cause 
   * issues with token rendering. 
   * 
   * It's called "pseudo-Mutex" because repeat method invocations aren't queued, 
   * they're effectively "dropped". However, it does ensure only a single invocation 
   * is executed at any time. 
   * 
   * @type {Boolean}
   * @static
   * @private
   */
  static _pseudoMutexEngaged = false;

  /** @override */
  async hoverOn(token) {
    if (token.actor.type === ACTOR_TYPES.PLAIN) return;
    await this._addHoverTo(token);
  }

  /** @override */
  async hoverOff(token) {
    if (token.actor.type === ACTOR_TYPES.PLAIN) return;
    this._removeHoverFrom(token);
  }

  /** @override */
  async updateOn(token) {
    if (token.actor.type === ACTOR_TYPES.PLAIN) return;

    if (TokenHealthConditions._pseudoMutexEngaged === true) return;
    TokenHealthConditions._pseudoMutexEngaged = true;
    this._removeStaticFrom(token);
    await this._addStaticTo(token);
    TokenHealthConditions._pseudoMutexEngaged = false;
  }

  /**
   * @param {Token} token 
   * @returns {Array<CharacterHealthCondition>}
   * 
   * @private
   */
  _getTokenHealthConditions(token) {
    const transientActor = token.actor.getTransientObject();
    return transientActor.health.states.concat([]).sort((a, b) => {
      const localizedA = game.i18n.localize(a.localizableName);
      const localizedB = game.i18n.localize(b.localizableName);
      return localizedA.localeCompare(localizedB);
    });
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
    if (ValidationUtil.isDefined(token.healthConditionContainer)) return;
    if (ValidationUtil.isDefined(token.healthConditionHoverContainer)) return;

    // Root container
    token.healthConditionContainer = new PIXI.Container();
    token.addChild(token.healthConditionContainer);

    const healthConditions = this._getTokenHealthConditions(token);

    const scale = this.getScale(token);
    const textScale = 0.65 * scale; // Magic constant seems a good default text scale. 
    const style = token._getTextStyle();
    let x = 0;
    let y = 0;
    let entryCount = 0;
    for (let i = 0; i < Math.min(this.MAX_STATIC_ICONS + 1, healthConditions.length); i++) {
      const healthCondition = healthConditions[i];
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

        // Backdrop
        const circleGraphics = new PIXI.Graphics();
        circleGraphics.beginFill(0x0, 0.5);
        const radius = this.ICON_SIZE_DEFAULT.width / 2;
        const backdrop = circleGraphics.drawCircle(0, 0, radius);
        backdrop.position.set(xInContainer + radius, radius);
        const blurStrength = 5;
        const blurQuality = 4;
        backdrop.filters = [
          new PIXI.BlurFilter(blurStrength, blurQuality)
        ];
        container.backDrop = backdrop;
        container.addChild(backdrop);

        // Icon
        const texture = await PixiLoader.load(healthCondition.iconTextureUrl);
        const sprite = new PIXI.Sprite(texture);
        sprite.width = this.ICON_SIZE_DEFAULT.width * scale;
        sprite.height = this.ICON_SIZE_DEFAULT.height * scale;
        sprite.position.set(xInContainer, 0);
        container.icon = sprite;
        container.addChild(sprite);

        if (!ValidationUtil.isDefined(token.healthConditionContainer)) {
          game.strive.logger.logWarn("Undefined container reference");
          continue;
        }
        token.healthConditionContainer.addChild(container);
        container.position.set(x, y);
        
        entryCount++;
        x += container.width + this.MARGIN;
        if (x >= token.w) {
          x = 0;
          y += container.height;
        }
      }
    }

    // Indicator that more hidden Conditions exist.
    if (entryCount === this.MAX_STATIC_ICONS && healthConditions.length > this.MAX_STATIC_ICONS) {
      const localized = StringUtil.format2(game.i18n.localize("system.character.health.condition.tokenMore"), {
        moreCount: healthConditions.length - entryCount,
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
    if (ValidationUtil.isDefined(token.healthConditionHoverContainer)) return;
    
    const healthConditions = this._getTokenHealthConditions(token);

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
    for await (const healthCondition of healthConditions) {
      const container = new PIXI.Container();
      container.position.set(x, y);
      let xInContainer = 0;
      if (!ValidationUtil.isDefined(token.healthConditionHoverContainer)) {
        game.strive.logger.logWarn("Undefined container reference");
        continue;
      }
      token.healthConditionHoverContainer.addChild(container);

      if (ValidationUtil.isDefined(healthCondition.iconTextureUrl)) {
        // Icon
        const texture = await PixiLoader.load(healthCondition.iconTextureUrl);
        const sprite = new PIXI.Sprite(texture);
        sprite.width = this.ICON_SIZE_HOVER.width * scale;
        sprite.height = this.ICON_SIZE_HOVER.height * scale;
        sprite.position.set(xInContainer, 0);
        container.icon = sprite;
        container.addChild(sprite);
        xInContainer += sprite.width + this.MARGIN;
      }

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
    }
  }
}
