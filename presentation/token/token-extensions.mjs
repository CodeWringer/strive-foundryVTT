import { isDefined } from "../../business/util/validation-utility.mjs";
import { PixiButton } from "../pixi/pixi-button.mjs";
import { TEXTURES } from "../pixi/pixi-preloader.mjs";

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
    if (token.actor.type !== "npc") return;

    const displayWhen = token.document.displayName;
    const isOwner = token.actor.isOwner || game.user.isGM;

    TokenExtensions._hideChallengeRatings(token);
    if (((displayWhen == CONST.TOKEN_DISPLAY_MODES.CONTROL || displayWhen == CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER || displayWhen == CONST.TOKEN_DISPLAY_MODES.OWNER) && isOwner) 
      || (displayWhen == CONST.TOKEN_DISPLAY_MODES.HOVER || displayWhen == CONST.TOKEN_DISPLAY_MODES.ALWAYS)) {
      if (token.hover) {
        TokenExtensions._showChallengeRatings(token);
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
  static _showChallengeRatings(token) {
    // Get the system's actor extensions object. 
    // This is assumed to be a npc type actor. 
    const actor = token.actor.getTransientObject();
    
    // Gather challenge ratings. 
    const challengeRatings = [];
    let lastChallengeRating;
    let allTheSameChallengeRating = true;
    for (const attributeGroup of actor.attributeGroups) {
      const isCrActive = actor.getIsCrActiveFor(attributeGroup.name);
      if (isCrActive !== true) continue;

      const challengeRating = actor.getCrFor(attributeGroup.name).modified;
      challengeRatings.push({
        attributeGroup: attributeGroup,
        value: challengeRating,
      });

      if (lastChallengeRating === undefined) {
        lastChallengeRating = challengeRating;
      } else if (lastChallengeRating !== challengeRating) {
        allTheSameChallengeRating = false;
      }
    };

    if (challengeRatings.length === 0) return; // No CRs to display. 
    
    // Determine text to display.
    const challengeRatingsForDisplay = [];
    if (allTheSameChallengeRating === true) {
      challengeRatingsForDisplay.push(`${game.i18n.localize("ambersteel.character.advancement.challengeRating.abbreviation")} ${lastChallengeRating}`);
    } else {
      for (const challengeRating of challengeRatings) {
        challengeRatingsForDisplay.push(`${game.i18n.localize(challengeRating.attributeGroup.localizableAbbreviation)} ${game.i18n.localize("ambersteel.character.advancement.challengeRating.abbreviation")} ${challengeRating.value}`);
      }
    }

    // Display challenge ratings. 
    const style = token._getTextStyle();
    token.challengeRatings = new PIXI.Container();
  
    for (let i = 0; i < challengeRatingsForDisplay.length; i++) {
      const challengeRating = challengeRatingsForDisplay[i];
  
      const text = new PreciseText(challengeRating, style);
      text.anchor.set(0.5, 0);
      text.position.set(token.w / 2, (token.h + text.height) + (text.height * i));
  
      token.challengeRatings.addChild(text);
    }
  
    token.addChild(token.challengeRatings);
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
  static _hideChallengeRatings(token) {
    if (isDefined(token.challengeRatings)) {
      token.removeChild(token.challengeRatings);
      token.challengeRatings = undefined;
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
    if (token.actor.type === "plain") return;
    
    if (token.inCombat === true) {
      if (isDefined(token.actionPoints) === true) {
        const actionPoints = token.actor.getTransientObject().actionPoints;
        TokenExtensions._updateActionPoints(token, actionPoints);
      } else {
        TokenExtensions._showActionPoints(token);
      }
    } else if (token.inCombat === false && isDefined(token.actionPoints) === true) {
      TokenExtensions._hideActionPoints(token);
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
  static _showActionPoints(token) {
    const transientActor = token.actor.getTransientObject();

    const margin = 5;
    let x = 0;

    // Container
    token.actionPoints = new PIXI.Container();

    // Action points sprite
    const sprite = new PIXI.Sprite(
      PIXI.Loader.shared.resources[TEXTURES.ACTION_POINT_EMPTY].texture
    );
    if (transientActor.actionPoints > 0) {
      sprite.texture = PIXI.Loader.shared.resources[TEXTURES.ACTION_POINT_FULL].texture;
    }

    // Caret left
    if (token.isOwner || game.user.isGM) {
      const caretLeft = new PixiButton({
        texture: PIXI.Loader.shared.resources[TEXTURES.CARET_LEFT].texture,
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
        texture: PIXI.Loader.shared.resources[TEXTURES.CARET_RIGHT].texture,
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
  static _hideActionPoints(token) {
    if (isDefined(token.actionPoints)) {
      token.removeChild(token.actionPoints);
      token.actionPoints = undefined;
    }
  }

  /**
   * @param {Token} token 
   * @param {Number} newActionPoints
   * 
   * @private
   * @static
   */
  static _updateActionPoints(token, newActionPoints) {
    this._hideActionPoints(token);
    this._showActionPoints(token);

    token.actionPoints.text.text = newActionPoints;

    if (newActionPoints === 0) {
      token.actionPoints.sprite.texture = PIXI.Loader.shared.resources[TEXTURES.ACTION_POINT_EMPTY].texture;
    } else {
      token.actionPoints.sprite.texture = PIXI.Loader.shared.resources[TEXTURES.ACTION_POINT_FULL].texture;
    }
  }
}
