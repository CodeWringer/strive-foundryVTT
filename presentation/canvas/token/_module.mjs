import GameSystemTokenHud from "./game-system-token-hud.mjs";
import TokenActionPoints from "./token-action-points.mjs";
import TokenExtender from "./token-extender.mjs";
import TokenExtensions from "./token-extensions.mjs";
import TokenHealthConditions from "./token-health-conditions.mjs";

export {
  GameSystemTokenHud,
  TokenActionPoints,
  TokenExtender,
  TokenExtensions,
  TokenHealthConditions,
};

/**
 * Wraps the `presentation.canvas.token` module. 
 */
export const token = {
  GameSystemTokenHud: GameSystemTokenHud,
  TokenActionPoints: TokenActionPoints,
  TokenExtender: TokenExtender,
  TokenExtensions: TokenExtensions,
  TokenHealthConditions: TokenHealthConditions,
  init: () => {
    // Override token hud.
    CONFIG.Token.hudClass = GameSystemTokenHud;
  },
};
