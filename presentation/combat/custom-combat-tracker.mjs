import { ACTOR_TYPES } from "../../business/document/actor/actor-types.mjs";
import { ValidationUtil } from "../../business/util/validation-utility.mjs";
import GritPointsCombatTrackerViewModel from "../sheet/actor/part/health/grit-points/grit-points-combat-tracker-viewmodel.mjs";
import CombatTrackerActionPointsViewModel from "./combat-tracker-action-points-viewmodel.mjs";

/**
 * @property {Array<CombatTrackerActionPointsViewModel>} actionPointsViewModels
 * @property {Array<GritPointsCombatTrackerViewModel>} gritPointsViewModels
 * 
 * @extends CombatTracker
 * @see https://foundryvtt.com/api/v10/classes/client.CombatTracker.html
 */
export default class CustomCombatTracker extends CombatTracker {
  /** @override */
  static get defaultOptions() {
    return {
      ...CombatTracker.defaultOptions,
      template: game.strive.const.TEMPLATES.COMBAT_TRACKER,
    };
  }

  /** @override */
  async getData(options) {
    const data = await super.getData(options);

    // Reset view models.
    this.actionPointsViewModels = [];
    this.gritPointsViewModels = [];

    // Extend the "turns" data. 
    for (const turn of data.turns) {
      // Find the combatant actor whose entry this is. 
      const combatant = this._getCombatant(turn.id);
      const document = combatant.actor;

      if (ValidationUtil.isDefined(document) !== true) {
        game.strive.logger.logWarn("Failed to get combatant actor");
        continue;
      } else if (document.type === ACTOR_TYPES.PLAIN) {
        continue;
      } 
      
      // Add action points view model. 
      turn.renderActionPoints = document.type !== ACTOR_TYPES.PLAIN;
      turn.actionPointsTemplate = CombatTrackerActionPointsViewModel.TEMPLATE;
      turn.actionPointsViewModel = new CombatTrackerActionPointsViewModel({
        id: `${turn.id}-aplist`,
        document: document,
        isEditable: document.isOwner || game.user.isGM,
      });
      this.actionPointsViewModels.push(turn.actionPointsViewModel);
      
      // Add grit points view model. 
      const transientActor = document.getTransientObject();
      turn.gritPointsTemplate = GritPointsCombatTrackerViewModel.TEMPLATE;
      turn.renderGritPoints = transientActor.type === ACTOR_TYPES.PC 
      || (transientActor.type === ACTOR_TYPES.NPC && transientActor.gritPoints.enable === true);

      turn.gritPointsViewModel = new GritPointsCombatTrackerViewModel({
        id: `${turn.id}-gplist`,
        isEditable: true,
        document: transientActor,
        isInCombatTracker: true,
      });
      this.gritPointsViewModels.push(turn.gritPointsViewModel);
    }


    return data;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    for (const viewModel of this.actionPointsViewModels) {
      viewModel.activateListeners(html);
    }

    for (const viewModel of this.gritPointsViewModels) {
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
      if (ValidationUtil.isDefined(combatant)) return combatant;
    }
  }
}
