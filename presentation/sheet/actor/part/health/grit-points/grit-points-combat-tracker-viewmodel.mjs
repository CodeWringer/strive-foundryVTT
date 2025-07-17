import { ACTOR_TYPES } from "../../../../../../business/document/actor/actor-types.mjs";
import TransientBaseCharacterActor from "../../../../../../business/document/actor/transient-base-character-actor.mjs";
import GameSystemUserSettings from "../../../../../../business/setting/game-system-user-settings.mjs";
import { ValidationUtil } from "../../../../../../business/util/validation-utility.mjs";
import ViewModel from "../../../../../view-model/view-model.mjs";
import GritPoint from "./grit-point.mjs";

/**
 * Represents the grit points bar of a character in the combat tracker. 
 * 
 * @extends ViewModel
 * 
 * @property {TransientBaseCharacterActor} document 
 * @property {Number} gritPointLimit 
 * * read-only
 * @property {Array<GritPoint>} gritPoints 
 */
export default class GritPointsCombatTrackerViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.ACTOR_GRIT_POINTS_COMBAT_TRACKER; }

  /**
   * @type {Number}
   * @readonly
   */
  get gritPointLimit() { return 5; }

  /**
   * Returns true, if the grit points list should be visible. 
   * 
   * This is the case, when the owning character has at least one injury. 
   * 
   * @type {Boolean}
   * @readonly
   */
  get shouldBeVisible() {
    if (this.document.type === ACTOR_TYPES.NPC && this.document.gritPoints.enable !== true) {
      return false;
    } else {
      return true;
    }
  }

  /**
   * @param {Object} args The arguments object. 
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * 
   * If no value is provided, a shortened UUID will be generated for it. 
   * 
   * This string may not contain any special characters! Alphanumeric symbols, as well as hyphen ('-') and 
   * underscore ('_') are permitted, but no dots, brackets, braces, slashes, equal sign, and so on. Failing to comply to this 
   * naming restriction may result in DOM elements not being properly detected by the `activateListeners` method. 
   * @param {ViewModel | undefined} args.parent Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, the view model data is editable.
   * * Default `false`. 
   * @param {TransientBaseCharacterActor} args.document 
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["document"]);

    this.document = args.document;

    const gritPoints = this.document.gritPoints.current;
    const gritPointsToRender = Math.max(gritPoints, this.gritPointLimit);

    this.gritPoints = [];
    for (let i = 0; i < gritPointsToRender; i++) {
      this.gritPoints.push(new GritPoint({
        id: `${this.id}-${i}`,
        active: i < gritPoints,
        value: i + 1,
      }));
    }
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    if (this.isEditable !== true) return;

    // Set up reset to 0. 
    html.find(`#${this.id}-grit-point-0`).click(async (event) => {
      event.preventDefault();

      this.document.gritPoints.current = 0;
    });

    // Set up set to value of clicked element. 
    for (let i = 0; i < this.gritPoints.length; i++) {
      const gritPoint = this.gritPoints[i];
      html.find(`#${gritPoint.id}`).click(async (event) => {
        this.document.gritPoints.current = gritPoint.value;
      });
    }
  }
}
