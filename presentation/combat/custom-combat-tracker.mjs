import { isDefined } from "../../business/util/validation-utility.mjs";
import { TEMPLATES } from "../templatePreloader.mjs";
import CombatTrackerActionPointsViewModel from "./combat-tracker-action-points-viewmodel.mjs";

/**
 * @extends CombatTracker
 * @see https://foundryvtt.com/api/v10/classes/client.CombatTracker.html
 */
export default class CustomCombatTracker extends CombatTracker {
  /** @override */
  static get defaultOptions() {
    return {
      ...CombatTracker.defaultOptions,
      template: TEMPLATES.COMBAT_TRACKER,
    };
  }

  /** @override */
  async getData(options) {
    // Reset view models.
    this.actionPointsViewModels = [];

    const data = await super.getData(options);
    // Extend the "turns" data. 
    for (const turn of data.turns) {
      // Find the combatant actor whose entry this is. 
      const combatant = this._getCombatant(turn.id);
      const document = combatant.actor;

      if (isDefined(document) !== true) {
        game.strive.logger.logWarn("Failed to get combatant actor");
        continue;
      } else if (document.type === "plain") {
        continue;
      }

      turn.renderActionPoints = document.type !== "plain";
      turn.actionPointsTemplate = TEMPLATES.COMBAT_TRACKER_ACTION_POINTS;
      const viewModel = new CombatTrackerActionPointsViewModel({
        id: `${turn.id}-aplist`,
        document: document,
        isEditable: document.isOwner || game.user.isGM,
      });
      this.actionPointsViewModels.push(viewModel);
      turn.actionPointsViewModel = viewModel;
    }

    return data;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    for (const viewModel of this.actionPointsViewModels) {
      viewModel.activateListeners(html);
    }
  }

  /**
   * Fetches and returns the combatant with the given ID. 
   * 
   * @param {String} id Id of the combatant to fetch. 
   * 
   * @returns {Combatant | undefined}
   * 
   * @private
   */
  _getCombatant(id) {
    for (const combat of this.combats) {
      const combatant = combat.combatants.find(it => it.id === id);
      if (isDefined(combatant)) return combatant;
    }
  }
}
