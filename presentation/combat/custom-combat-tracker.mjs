import DocumentFetcher from "../../business/document/document-fetcher/document-fetcher.mjs";
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
    const docFetcher = new DocumentFetcher();

    // Reset view models.
    this.actionPointsViewModels = [];

    const data = await super.getData(options);
    // Extend the "turns" data. 
    for (const turn of data.turns) {
      const document = await docFetcher.find({
        id: turn.id,
        documentType: "Actor",
      });

      if (isDefined(document) !== true) {
        game.ambersteel.logger.logWarn("Failed to get combatant actor");
        continue;
      }

      turn.actionPointsTemplate = TEMPLATES.COMBAT_TRACKER_ACTION_POINTS;
      const viewModel = new CombatTrackerActionPointsViewModel({
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
}
