import FoundryWrapper from "../../foundry-interop/foundry-wrapper.mjs";
import { TEMPLATES } from "../templatePreloader.mjs";

/**
 * Overrides to FoundryVTT's default token HUD. 
 * 
 * @see https://foundryvtt.com/api/v12/classes/client.TokenHUD.html 
 */
export default class GameSystemTokenHud extends FoundryWrapper.TokenHUD {
  /** @override */
  get template() { return TEMPLATES.TOKEN_HUD; }
}
