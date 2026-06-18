import { ValidationUtil } from "../../common/util/validation-utility.mjs";
import TokenActionPoints from "./token-action-points.mjs";
import TokenHealthConditions from "./token-health-conditions.mjs";

/**
 * Provides token utilities. 
 */
export default class TokenExtensions {
  static ACTION_POINTS = new TokenActionPoints();
  static HEALTH_CONDITIONS = new TokenHealthConditions();

  /**
   * Handles token hover extensions. 
   * 
   * @param {Token} token 
   * 
   * @see https://foundryvtt.com/api/classes/client.Token.html
   * 
   * @async
   * @static
   */
  static async updateTokenHover(token) {
    if (ValidationUtil.isDefined(token) !== true) return;
    if (ValidationUtil.isDefined(token.actor) !== true) return;

    if (token.hover) {
      await TokenExtensions.ACTION_POINTS.hoverOn(token);
      await TokenExtensions.HEALTH_CONDITIONS.hoverOn(token);
    } else {
      await TokenExtensions.ACTION_POINTS.hoverOff(token);
      await TokenExtensions.HEALTH_CONDITIONS.hoverOff(token);
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
   * @async
   */
  static async updateTokenCombatant(token) {
    if (ValidationUtil.isDefined(token) !== true) return;
    if (ValidationUtil.isDefined(token.actor) !== true) return;
    
    await TokenExtensions.ACTION_POINTS.updateOn(token);
    await TokenExtensions.HEALTH_CONDITIONS.updateOn(token);
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
