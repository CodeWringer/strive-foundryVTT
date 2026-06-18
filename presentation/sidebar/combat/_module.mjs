import CombatTrackerActionPointsViewModel from "./combat-tracker-action-points-viewmodel.mjs";
import CustomCombatTracker from "./custom-combat-tracker.mjs";

export {
  CombatTrackerActionPointsViewModel,
  CustomCombatTracker,
};

/**
 * Wraps the `presentation.sidebar.combat` module. 
 */
export const combat = {
  CombatTrackerActionPointsViewModel: CombatTrackerActionPointsViewModel,
  CustomCombatTracker: CustomCombatTracker,
  init: () => {
    // Override combat tracker. 
    CONFIG.ui.combat = CustomCombatTracker;
  },
};
