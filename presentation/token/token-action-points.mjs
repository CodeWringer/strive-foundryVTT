import { ACTOR_TYPES } from "../../business/model/document/actor/actor-types.mjs"
import { ValidationUtil } from "../../common/util/validation-utility.mjs"
import PixiButton from "../pixi/pixi-button.mjs"
import { PixiLoader } from "../pixi/pixi-preloader.mjs"
import TokenExtender from "./token-extender.mjs"

/**
 * Provides token utilities to render and update action points on a token. 
 */
export default class TokenActionPoints extends TokenExtender {
  /**
   * Adds an interactible action point bar to the given token. 
   * 
   * @param {Token} token 
   * 
   * @private
   */
  addTo(token) {
    if (!ValidationUtil.isDefined(token.actor)) return;

    const transientActor = token.actor.getTransientObject();

    const scale = this.getScale(token);

    const heightPx = 42 * scale; // 42 because that's the action point image's height. 
    const textScale = 1.2 * scale; // 1.2 magic constant seems a good default text scale. 
    const caretScale = 0.6;
    const caretSize = {
      width: (heightPx / 2) * caretScale,
      height: heightPx * caretScale,
    }
    const marginPx = 2 * scale;

    // Container
    token.actionPointContainer = new PIXI.Container();
    token.addChild(token.actionPointContainer);

    // Action points sprite
    let actionPointTexture;
    if (transientActor.actionPoints.current > 0) {
      actionPointTexture = PixiLoader.getTexture(PixiLoader.TEXTURES.ACTION_POINT_EMPTY);
    } else {
      actionPointTexture = PixiLoader.getTexture(PixiLoader.TEXTURES.ACTION_POINT_FULL);
    }
    const actionPointSprite = new PIXI.Sprite(actionPointTexture);
    token.actionPointContainer.actionPointSprite = actionPointSprite;

    actionPointSprite.width = heightPx;
    actionPointSprite.height = heightPx;
    actionPointSprite.position.set(
      (token.w - actionPointSprite.width) / 2,
      (token.h - actionPointSprite.height) + ((actionPointSprite.height - caretSize.height) / 2)
    );
    token.actionPointContainer.addChild(actionPointSprite);

    // Action points text
    const style = token._getTextStyle();
    const text = new PreciseText(transientActor.actionPoints.current, style);
    text.anchor.set(0.5, 0.5);
    text.scale.set(textScale, textScale);
    text.position.set(
      actionPointSprite.x + (actionPointSprite.width / 2), 
      actionPointSprite.y + (actionPointSprite.height / 2)
    );
    token.actionPointContainer.text = text;
    token.actionPointContainer.addChild(text);
    
    // Caret left
    if (token.isOwner || game.user.isGM) {
      const caretLeft = new PixiButton({
        texture: PixiLoader.getTexture(PixiLoader.TEXTURES.CARET_LEFT),
        onClick: () => {
          if (!token.isOwner && !game.user.isGM) return;
          
          const newActionPoints = Math.max(0, transientActor.actionPoints.current - 1);
          transientActor.actionPoints.current = newActionPoints;
          this.updateOn(token);
        },
      });
      caretLeft.width = caretSize.width;
      caretLeft.height = caretSize.height;
      caretLeft.position.set(
        actionPointSprite.position.x - caretLeft.width - marginPx,
        actionPointSprite.position.y + (actionPointSprite.height - caretLeft.height) / 2
      );
      token.actionPointContainer.caretLeft = caretLeft;
      token.actionPointContainer.addChild(caretLeft.container);
    }
    
    // Caret right
    if (token.isOwner || game.user.isGM) {
      const caretRight = new PixiButton({
        texture: PixiLoader.getTexture(PixiLoader.TEXTURES.CARET_RIGHT),
        onClick: () => {
          if (!token.isOwner && !game.user.isGM) return;
          
          const newActionPoints = Math.min(transientActor.actionPoints.maximum, transientActor.actionPoints.current + 1);
          transientActor.actionPoints.current = newActionPoints;
          this.updateOn(token);
        },
      });
      caretRight.width = caretSize.width;
      caretRight.height = caretSize.height;
      caretRight.position.set(
        actionPointSprite.position.x + actionPointSprite.width + marginPx,
        actionPointSprite.position.y + (actionPointSprite.height - caretRight.height) / 2
      );
      token.actionPointContainer.caretRight = caretRight;
      token.actionPointContainer.addChild(caretRight.container);
    }
  }
  
  /**
   * Removes the interactible action point bar from the given token. 
   * 
   * @param {Token} token 
   * 
   * @private
   */
  removeFrom(token) {
    if (ValidationUtil.isDefined(token.actionPointContainer)) {
      token.removeChild(token.actionPointContainer);
      token.actionPointContainer = undefined;
    }
  }

  /**
   * Updates the given token's current action point display. 
   * 
   * That means updating the texture and number, based on the current 
   * action point count. 
   * 
   * @param {Token} token 
   * 
   * @async
   */
  async updateOn(token) {
    if (token.actor.type === ACTOR_TYPES.PLAIN) return;

    if (token.inCombat === true) {
      if (ValidationUtil.isDefined(token.actionPointContainer) === true 
        && ValidationUtil.isDefined(token.actionPointContainer.text)
        && ValidationUtil.isDefined(token.actionPointContainer.text.text)
      ) {
        const newActionPoints = token.actor.getTransientObject().actionPoints.current;
        token.actionPointContainer.text.text = newActionPoints;

        if (newActionPoints > 0) {
          token.actionPointContainer.actionPointSprite.texture = PixiLoader.getTexture(PixiLoader.TEXTURES.ACTION_POINT_FULL);
        } else {
          token.actionPointContainer.actionPointSprite.texture = PixiLoader.getTexture(PixiLoader.TEXTURES.ACTION_POINT_EMPTY);
        }
      } else {
        this.removeFrom(token);
        this.addTo(token);
      }
    } else if (ValidationUtil.isDefined(token.actionPointContainer) === true) {
      this.removeFrom(token);
    }
  }
}
