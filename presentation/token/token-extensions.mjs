import { ACTOR_TYPES } from "../../business/document/actor/actor-types.mjs";
import { ValidationUtil } from "../../business/util/validation-utility.mjs";
import { PixiButton } from "../pixi/pixi-button.mjs";
import { TEXTURES, getPixiTexture } from "../pixi/pixi-preloader.mjs";

/**
 * Provides token utilities. 
 */
export default class TokenExtensions {
  /**
   * Handles token hover extensions. 
   * 
   * @param {Token} token 
   * 
   * @see https://foundryvtt.com/api/classes/client.Token.html
   * 
   * @static
   */
  static updateTokenHover(token) {
    if (!ValidationUtil.isDefined(token.actor) && token.actor.type !== ACTOR_TYPES.NPC) return;

    // const displayWhen = token.document.displayName;
    // const isOwner = token.actor.isOwner || game.user.isGM;

    // if (((displayWhen == CONST.TOKEN_DISPLAY_MODES.CONTROL || displayWhen == CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER || displayWhen == CONST.TOKEN_DISPLAY_MODES.OWNER) && isOwner) 
    //   || (displayWhen == CONST.TOKEN_DISPLAY_MODES.HOVER || displayWhen == CONST.TOKEN_DISPLAY_MODES.ALWAYS)) {
    //   if (token.hover) {
    //     // Do nothing, atm.
    //   }
    // }
  }

  /**
   * Handles combatant token extensions. 
   * 
   * @param {Token} token 
   * 
   * @see https://foundryvtt.com/api/classes/client.Token.html
   * 
   * @static
   */
  static updateTokenCombatant(token) {
    if (ValidationUtil.isDefined(token) !== true) return;
    if (ValidationUtil.isDefined(token.actor) !== true) return;
    if (token.actor.type === ACTOR_TYPES.PLAIN) return;
    
    if (token.inCombat === true) {
      if (ValidationUtil.isDefined(token.actionPointContainer) === true) {
        const actionPoints = token.actor.getTransientObject().actionPoints.current;
        TokenExtensions._updateActionPoints(token, actionPoints);
      } else {
        TokenExtensions._removeActionPointControls(token);
        TokenExtensions._addActionPointControls(token);
      }
    } else if (token.inCombat === false && ValidationUtil.isDefined(token.actionPointContainer) === true) {
      TokenExtensions._removeActionPointControls(token);
    }
  }

  /**
   * Updates all combatant tokens. 
   * 
   * This re-renders the action points. 
   * 
   * @static
   */
  static updateTokenCombatants() {
    if (!ValidationUtil.isDefined(game.scenes)) return;
    if (!ValidationUtil.isDefined(game.scenes.active)) return;

    for (const tokenDocument of game.scenes.active.tokens.values()) {
      TokenExtensions.updateTokenCombatant(tokenDocument.object);
    }
  }

  /**
   * Adds an interactible action point bar to the given token. 
   * 
   * @param {Token} token 
   * 
   * @see https://foundryvtt.com/api/classes/client.Token.html
   * 
   * @private
   * @static
   */
  static _addActionPointControls(token) {
    if (!ValidationUtil.isDefined(token.actor)) return;

    const transientActor = token.actor.getTransientObject();

    const scale = token.h / 100.0; // Baseline from 100px. If the canvas size changes, this number changes. 

    const heightPx = 42 * scale; // 42 because that's the image's height. 
    const textScale = 1.2 * scale; // 1.2 magic constant seems a good default text scale. 
    const caretScale = 0.6 * scale;
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
      actionPointTexture = getPixiTexture(TEXTURES.ACTION_POINT_EMPTY);
    } else {
      actionPointTexture = getPixiTexture(TEXTURES.ACTION_POINT_FULL);
    }
    const actionPointSprite = new PIXI.Sprite(
      actionPointTexture
    );
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
        texture: getPixiTexture(TEXTURES.CARET_LEFT),
        onClick: () => {
          if (!token.isOwner && !game.user.isGM) return;
          
          const newActionPoints = Math.max(0, transientActor.actionPoints.current - 1);
          transientActor.actionPoints.current = newActionPoints;
          TokenExtensions._updateActionPoints(token, newActionPoints);
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
        texture: getPixiTexture(TEXTURES.CARET_RIGHT),
        onClick: () => {
          if (!token.isOwner && !game.user.isGM) return;
          
          const newActionPoints = Math.min(transientActor.actionPoints.maximum, transientActor.actionPoints.current + 1);
          transientActor.actionPoints.current = newActionPoints;
          TokenExtensions._updateActionPoints(token, newActionPoints);
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
   * @see https://foundryvtt.com/api/classes/client.Token.html
   * 
   * @private
   * @static
   */
  static _removeActionPointControls(token) {
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
   * @param {Number} newActionPoints
   * 
   * @private
   * @static
   */
  static _updateActionPoints(token, newActionPoints) {
    if (ValidationUtil.isDefined(token.actionPointContainer) !== true) return;
    if (ValidationUtil.isDefined(token.actionPointContainer.text) !== true) return;
    if (ValidationUtil.isDefined(token.actionPointContainer.text.text) !== true) return;

    token.actionPointContainer.text.text = newActionPoints;

    if (newActionPoints > 0) {
      token.actionPointContainer.actionPointSprite.texture = getPixiTexture(TEXTURES.ACTION_POINT_FULL);
    } else {
      token.actionPointContainer.actionPointSprite.texture = getPixiTexture(TEXTURES.ACTION_POINT_EMPTY);
    }
  }
}
