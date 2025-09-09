import { ACTOR_TYPES } from "../../business/document/actor/actor-types.mjs";
import { ValidationUtil } from "../../business/util/validation-utility.mjs";
import TokenActionPoints from "./token-action-points.mjs";
import TokenHealthConditions from "./token-health-conditions.mjs";

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
    if (ValidationUtil.isDefined(token) !== true) return;
    if (ValidationUtil.isDefined(token.actor) !== true) return;
    if (token.actor.type === ACTOR_TYPES.PLAIN) return;

    if (token.hover) {
      TokenHealthConditions.hoverOn(token);
    } else {
      TokenHealthConditions.hoverOff(token);
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
    if (ValidationUtil.isDefined(token) !== true) return;
    if (ValidationUtil.isDefined(token.actor) !== true) return;
    if (token.actor.type === ACTOR_TYPES.PLAIN) return;
    
    if (token.inCombat === true) {
      if (ValidationUtil.isDefined(token.actionPointContainer) === true) {
        TokenActionPoints.updateOn(token);
      } else {
        TokenActionPoints.removeFrom(token);
        TokenActionPoints.addTo(token);
      }
    } else if (token.inCombat === false && ValidationUtil.isDefined(token.actionPointContainer) === true) {
      TokenActionPoints.removeFrom(token);
    }

    TokenHealthConditions.updateOn(token);
  }

  /**
   * Updates and re-renders all combatant tokens. 
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
