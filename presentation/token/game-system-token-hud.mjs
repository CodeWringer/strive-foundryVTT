import { TEMPLATES } from "../templatePreloader.mjs";

/**
 * Overrides to FoundryVTT's default token HUD. 
 * 
 * @extends foundry.applications.hud.TokenHUD
 * @see https://foundryvtt.com/api/classes/foundry.applications.hud.TokenHUD.html
 */
export default class GameSystemTokenHud extends foundry.applications.hud.TokenHUD {
  /** @override */
  get template() { return TEMPLATES.TOKEN_HUD; }
}
