/**
 * Provides token utilities. 
 */
export default class TokenExtensions {
  /**
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
    if (token.challengeRatings !== undefined) {
      token.removeChild(token.challengeRatings);
      token.challengeRatings = undefined;
    }
  }
}

