import { isDefined } from "../../business/util/validation-utility.mjs";
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
   */
  handleTokenHover(token) {
    if (token.actor.type !== "npc") return;

    const displayWhen = token.document.displayName;
    const isOwner = token.actor.isOwner || game.user.isGM;

    if (((displayWhen == 10 || displayWhen == 20 || displayWhen == 40) && isOwner) || (displayWhen == 30 || displayWhen == 50)) {
      if (token.hover) {
        this.drawChallengeRatings(token);
      } else {
        this.hideChallengeRatings(token);
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
   */
  drawChallengeRatings(token) {
    // Get the system's actor extensions object. 
    const actor = token.actor.getTransientObject();
    
    // Gather challenge ratings. 
    const challengeRatings = [];
    let lastChallengeRating;
    let allTheSameChallengeRating = true;
    for (const attributeGroup of actor.attributeGroups) {
      const isCrActive = actor.getIsCrActiveFor(attributeGroup.name);
      if (isCrActive !== true) continue;

      const challengeRating = (actor.challengeRatings.find(it => it.key === attributeGroup.name) ?? {}).value ?? 0;
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
   */
  hideChallengeRatings(token) {
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
   */
  handleTokenCombatant(token) {
    if (token.inCombat === true && isDefined(token.actionPoints) === false) {
      this.drawActionPoints(token);
    } else if (token.inCombat === false && isDefined(token.actionPoints) === true) {
      this.hideActionPoints(token);
    }
  }

  /**
   * Adds an interactible action point bar to the given token. 
   * 
   * @param {Token} token 
   * 
   * @see https://foundryvtt.com/api/classes/client.Token.html
   */
  drawActionPoints(token) {
    const transientActor = token.actor.getTransientObject();

    const margin = 5;

    // Container
    token.actionPoints = new PIXI.Container();

    console.log(token);

    // Action points sprite
    const sprite = new PIXI.Sprite(
      PIXI.Loader.shared.resources[TEXTURES.ACTION_POINT_EMPTY].texture
    );
    if (transientActor.actionPoints > 0) {
      sprite.texture = PIXI.Loader.shared.resources[TEXTURES.ACTION_POINT_FULL].texture;
    }

    // Caret left
    const caretLeft = new PIXI.Sprite(
      PIXI.Loader.shared.resources[TEXTURES.CARET_LEFT].texture
    );
    caretLeft.interactive = true;
    caretLeft.on("click", (event) => {
      if (!token.isOwner && !game.user.isGM) return;
      
      const newActionPoints = Math.max(0, transientActor.actionPoints - 1);
      transientActor.actionPoints = newActionPoints;
      this._updateActionPoints(token, newActionPoints);
    });
    caretLeft.width = caretLeft.width / 2;
    caretLeft.height = caretLeft.height / 2;
    caretLeft.position.set(0, (sprite.height / 2) - (caretLeft.height / 2));
    token.actionPoints.caretLeft = caretLeft;
    token.actionPoints.addChild(caretLeft);
    
    // Action points sprite arrangement
    sprite.position.set(caretLeft.x + caretLeft.width + margin, 0);
    token.actionPoints.sprite = sprite;
    token.actionPoints.addChild(sprite);

    // Action points text
    const style = token._getTextStyle();
    const text = new PreciseText(transientActor.actionPoints, style);
    text.anchor.set(0.5, 0.5);
    text.position.set(sprite.x + sprite.width / 2, sprite.y + sprite.height / 2);
    token.actionPoints.text = text;
    token.actionPoints.addChild(text);

    // Caret right
    const caretRight = new PIXI.Sprite(
      PIXI.Loader.shared.resources[TEXTURES.CARET_RIGHT].texture
    );
    caretRight.interactive = true;
    caretRight.on("click", (event) => {
      if (!token.isOwner && !game.user.isGM) return;

      const newActionPoints = Math.min(transientActor.maxActionPoints, transientActor.actionPoints + 1);
      transientActor.actionPoints = newActionPoints;
      this._updateActionPoints(token, newActionPoints);
    });
    caretRight.width = caretRight.width / 2;
    caretRight.height = caretRight.height / 2;
    caretRight.position.set(sprite.x + sprite.width + margin, (sprite.height / 2) - (caretRight.height / 2));
    token.actionPoints.caretRight = caretRight;
    token.actionPoints.addChild(caretRight);

    token.addChild(token.actionPoints);

    // Container arrangement
    const heightRatio = token.actionPoints.height / token.actionPoints.width;
    token.actionPoints.width = token.w;
    token.actionPoints.height = token.w * heightRatio;
    token.actionPoints.y = token.h - token.actionPoints.height;
  }
  
  /**
   * Removes the interactible action point bar from the given token. 
   * 
   * @param {Token} token 
   * 
   * @see https://foundryvtt.com/api/classes/client.Token.html
   */
  hideActionPoints(token) {
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
   */
  _updateActionPoints(token, newActionPoints) {
    if (isDefined(token.actionPoints)) {
      token.actionPoints.text.text = newActionPoints;

      if (newActionPoints === 0) {
        token.actionPoints.sprite.texture = PIXI.Loader.shared.resources[TEXTURES.ACTION_POINT_EMPTY].texture;
      } else {
        token.actionPoints.sprite.texture = PIXI.Loader.shared.resources[TEXTURES.ACTION_POINT_FULL].texture;
      }
    }
  }
}
