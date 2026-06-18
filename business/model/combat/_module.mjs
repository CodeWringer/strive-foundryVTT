import GameSystemCombat from "./game-system-combat.mjs";
import GameSystemCombatant from "./game-system-combatant.mjs";

export {
  GameSystemCombat,
  GameSystemCombatant,
};

/**
 * Wraps the `business.model.combat` module, for all combat model classes. 
 * 
 * Note the `init` function MUST be called during system setup!
 */
export const combat = {
  GameSystemCombat: GameSystemCombat,
  GameSystemCombatant: GameSystemCombatant,
  init: () => {
    // Set initiative formula on global CONFIG variable provided by FoundryVTT.
    CONFIG.Combat.initiative = {
      formula: "1D20 + @baseInitiative",
      decimals: 0
    };
  },
};
