import { validateOrThrow } from "../../business/util/validation-utility.mjs";
import ViewModel from "../view-model/view-model.mjs";

/**
 * Represents the action points bar of a single combatant entry 
 * in the combat tracker. 
 * 
 * @extends ViewModel
 * 
 * @property {Actor} document 
 */
export default class CombatTrackerActionPointsViewModel extends ViewModel {
  /**
   * @param {Object} args 
   * @param {Actor} args.document 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["document"]);

    this.document = args.document;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    if (this.isEditable === true) {
      html.find(`#${this.id}-empty-ap`).click(async (event) => {
        event.preventDefault();

        const transientActor = this.document.getTransientObject();
        transientActor.actionPoints = 0;
      });
    }
  }
}
