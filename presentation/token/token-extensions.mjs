import { ACTOR_TYPES } from "../../business/document/actor/actor-types.mjs";
import { ValidationUtil } from "../../business/util/validation-utility.mjs";
import TokenActionPoints from "./token-action-points.mjs";

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
        TokenActionPoints.updateOn(token, actionPoints);
      } else {
        TokenActionPoints.removeFrom(token);
        TokenActionPoints.addTo(token);
      }
    } else if (token.inCombat === false && ValidationUtil.isDefined(token.actionPointContainer) === true) {
      TokenActionPoints.removeFrom(token);
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
}
