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
    this.actionPoints = [];
    const transientActor = this.document.getTransientObject();
    for (let i = 0; i < transientActor.maxActionPoints; i++) {
      this.actionPoints.push({
        id: `${this.id}-${i}`,
        full: i < transientActor.actionPoints,
        value: i + 1,
      });
    }
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    const transientActor = this.document.getTransientObject();

    if (this.isEditable === true) {
      html.find(`#${this.id}-empty-ap`).click(async (event) => {
        event.preventDefault();

        transientActor.actionPoints = 0;
      });

      for (let i = 0; i < transientActor.maxActionPoints; i++) {
        html.find(`#${this.id}-${i}`).click(async (event) => {
          transientActor.actionPoints = i + 1;
        });
      }
    }
  }
}
