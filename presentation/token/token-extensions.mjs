import { ACTOR_TYPES } from "../../business/document/actor/actor-types.mjs";
import { isDefined } from "../../business/util/validation-utility.mjs";
import { PixiButton } from "../pixi/pixi-button.mjs";
import { TEXTURES, getPixiTexture } from "../pixi/pixi-preloader.mjs";

/**
 * Provides token utilities. 
 * 
 * Can add challenge ratings and action point controls to tokens. 
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
    if (token.actor.type !== ACTOR_TYPES.NPC) return;

    const displayWhen = token.document.displayName;
    const isOwner = token.actor.isOwner || game.user.isGM;

    TokenExtensions._hideChallengeRating(token);
    if (((displayWhen == CONST.TOKEN_DISPLAY_MODES.CONTROL || displayWhen == CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER || displayWhen == CONST.TOKEN_DISPLAY_MODES.OWNER) && isOwner) 
      || (displayWhen == CONST.TOKEN_DISPLAY_MODES.HOVER || displayWhen == CONST.TOKEN_DISPLAY_MODES.ALWAYS)) {
      if (token.hover) {
        TokenExtensions._showChallengeRating(token);
      }
    }
  }

  /**
   * Shows the challenge ratings of an NPC represented by the given token, *if* the 
   * given token represents an NPC. 
   * 
   * @param {Token} token 
   * 
   * @see https://foundryvtt.com/api/classes/client.Token.html
   * 
   * @static
   * @private
   */
  static _showChallengeRating(token) {
    const actor = token.actor.getTransientObject();
    
    if (actor.isChallengeRatingEnabled) {
      const text = `${game.i18n.localize("system.character.advancement.challengeRating.abbreviation")} ${actor.challengeRating.modified}`;

      token.challengeRating = new PreciseText(text, token._getTextStyle());
      token.challengeRating.anchor.set(0.5, 0);
      token.challengeRating.position.set(token.w / 2, token.h + token.challengeRating.height);

      token.addChild(token.challengeRating);
    }
  }
  
  /**
   * Hides the given token's challenge ratings, if any are currently displayed for it. 
   * 
   * @param {Token} token 
   * 
   * @see https://foundryvtt.com/api/classes/client.Token.html
   * 
   * @private
   * @static
   */
  static _hideChallengeRating(token) {
    if (isDefined(token.challengeRating)) {
      token.removeChild(token.challengeRating);
      token.challengeRating = undefined;
    }
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
    if (isDefined(token) !== true) return;
    if (isDefined(token.actor) !== true) return;
    if (token.actor.type === ACTOR_TYPES.PLAIN) return;
    
    if (token.inCombat === true) {
      if (isDefined(token.actionPoints) === true) {
        const actionPoints = token.actor.getTransientObject().actionPoints;
        TokenExtensions._updateActionPoints(token, actionPoints);
      } else {
        TokenExtensions._removeActionPointControls(token);
        TokenExtensions._addActionPointControls(token);
      }
    } else if (token.inCombat === false && isDefined(token.actionPoints) === true) {
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
    const transientActor = token.actor.getTransientObject();

    const margin = 5;
    let x = 0;

    // Container
    token.actionPoints = new PIXI.Container();

    // Action points sprite
    const sprite = new PIXI.Sprite(
      getPixiTexture(TEXTURES.ACTION_POINT_EMPTY)
    );
    if (transientActor.actionPoints > 0) {
      sprite.texture = getPixiTexture(TEXTURES.ACTION_POINT_FULL);
    }

    // Caret left
    if (token.isOwner || game.user.isGM) {
      const caretLeft = new PixiButton({
        texture: getPixiTexture(TEXTURES.CARET_LEFT),
        onClick: () => {
          if (!token.isOwner && !game.user.isGM) return;
          
          const newActionPoints = Math.max(0, transientActor.actionPoints - 1);
          transientActor.actionPoints = newActionPoints;
          TokenExtensions._updateActionPoints(token, newActionPoints);
        },
      });
      caretLeft.width = caretLeft.width / 2;
      caretLeft.height = caretLeft.height / 2;
      caretLeft.position.set(x, (sprite.height / 2) - (caretLeft.height / 2));
      token.actionPoints.caretLeft = caretLeft;
      token.actionPoints.addChild(caretLeft.wrapped);
      x = caretLeft.x + caretLeft.width + margin;
    }
    
    // Action points sprite arrangement
    sprite.position.set(x, 0);
    token.actionPoints.sprite = sprite;
    token.actionPoints.addChild(sprite);
    x = sprite.x + sprite.width;

    // Action points text
    const style = token._getTextStyle();
    const text = new PreciseText(transientActor.actionPoints, style);
    text.anchor.set(0.5, 0.5);
    text.scale.set(1.2, 1.2);
    text.position.set(sprite.x + sprite.width / 2, sprite.y + sprite.height / 2);
    token.actionPoints.text = text;
    token.actionPoints.addChild(text);

    // Caret right
    if (token.isOwner || game.user.isGM) {
      const caretRight = new PixiButton({
        texture: getPixiTexture(TEXTURES.CARET_RIGHT),
        onClick: () => {
          if (!token.isOwner && !game.user.isGM) return;
          
          const newActionPoints = Math.min(transientActor.maxActionPoints, transientActor.actionPoints + 1);
          transientActor.actionPoints = newActionPoints;
          TokenExtensions._updateActionPoints(token, newActionPoints);
        },
      });
      caretRight.width = caretRight.width / 2;
      caretRight.height = caretRight.height / 2;
      caretRight.position.set(x + margin, (sprite.height / 2) - (caretRight.height / 2));
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
    if (isDefined(token.actionPoints)) {
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
    if (isDefined(token.actionPoints) !== true) return;
    if (isDefined(token.actionPoints.text) !== true) return;
    if (isDefined(token.actionPoints.text.text) !== true) return;

    token.actionPoints.text.text = newActionPoints;

    if (newActionPoints === 0) {
      token.actionPoints.sprite.texture = getPixiTexture(TEXTURES.ACTION_POINT_EMPTY);
    } else {
      token.actionPoints.sprite.texture = getPixiTexture(TEXTURES.ACTION_POINT_FULL);
    }
  }
}
