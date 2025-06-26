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
      if (ValidationUtil.isDefined(token.actionPoints) === true) {
        const actionPoints = token.actor.getTransientObject().actionPoints.current;
        TokenExtensions._updateActionPoints(token, actionPoints);
      } else {
        TokenExtensions._removeActionPointControls(token);
        TokenExtensions._addActionPointControls(token);
      }
    } else if (token.inCombat === false && ValidationUtil.isDefined(token.actionPoints) === true) {
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

    const margin = 5;
    const caretSizeFactor = 0.5;
    let x = 0;

    // Container
    token.actionPoints = new PIXI.Container();

    // Action points sprite
    let actionPointSprite; 
    if (transientActor.actionPoints.current > 0) {
      actionPointSprite = new PIXI.Sprite(
        getPixiTexture(TEXTURES.ACTION_POINT_EMPTY)
      );
    } else {
      actionPointSprite = new PIXI.Sprite(
        getPixiTexture(TEXTURES.ACTION_POINT_FULL)
      );
    }

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
      caretLeft.width = caretLeft.width * caretSizeFactor;
      caretLeft.height = caretLeft.height * caretSizeFactor;
      caretLeft.position.set(x, (actionPointSprite.height / 2) - (caretLeft.height / 2));
      token.actionPoints.caretLeft = caretLeft;
      token.actionPoints.addChild(caretLeft.wrapped);
      x = caretLeft.x + caretLeft.width + margin;
    }
    
    // Action points sprite arrangement
    actionPointSprite.position.set(x, 0);
    token.actionPoints.sprite = actionPointSprite;
    token.actionPoints.addChild(actionPointSprite);
    x = actionPointSprite.x + actionPointSprite.width;

    // Action points text
    const style = token._getTextStyle();
    const text = new PreciseText(transientActor.actionPoints.current, style);
    text.anchor.set(0.5, 0.5);
    text.scale.set(1.2, 1.2);
    text.position.set(actionPointSprite.x + actionPointSprite.width / 2, actionPointSprite.y + actionPointSprite.height / 2);
    token.actionPoints.text = text;
    token.actionPoints.addChild(text);

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
      caretRight.width = caretRight.width * caretSizeFactor;
      caretRight.height = caretRight.height * caretSizeFactor;
      caretRight.position.set(x + margin, (actionPointSprite.height / 2) - (caretRight.height / 2));
      token.actionPoints.caretRight = caretRight;
      token.actionPoints.addChild(caretRight.wrapped);
    }

    token.addChild(token.actionPoints);

    // Container arrangement
    const finalHeight = token.h * 0.40;
    const ratio = finalHeight / token.actionPoints.height;
    token.actionPoints.width = token.actionPoints.width * ratio;
    token.actionPoints.height = finalHeight;
    token.actionPoints.x = (token.w / 2) - (token.actionPoints.width / 2);
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
    if (ValidationUtil.isDefined(token.actionPoints)) {
      token.removeChild(token.actionPoints);
      token.actionPoints = undefined;
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
    if (ValidationUtil.isDefined(token.actionPoints) !== true) return;
    if (ValidationUtil.isDefined(token.actionPoints.text) !== true) return;
    if (ValidationUtil.isDefined(token.actionPoints.text.text) !== true) return;

    token.actionPoints.text.text = newActionPoints;

    if (newActionPoints === 0) {
      token.actionPoints.sprite.texture = getPixiTexture(TEXTURES.ACTION_POINT_EMPTY);
    } else {
      token.actionPoints.sprite.texture = getPixiTexture(TEXTURES.ACTION_POINT_FULL);
    }
  }
}
