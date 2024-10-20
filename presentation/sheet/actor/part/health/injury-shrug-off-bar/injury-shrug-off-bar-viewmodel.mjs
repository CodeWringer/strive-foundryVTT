import TransientBaseCharacterActor from "../../../../../../business/document/actor/transient-base-character-actor.mjs";
import { ValidationUtil } from "../../../../../../business/util/validation-utility.mjs";
import ViewModel from "../../../../../view-model/view-model.mjs";

/**
 * Represents the injury shrug-off bar on a character sheet. 
 * 
 * @extends ViewModel
 * 
 * @property {TransientBaseCharacterActor} document 
 * @property {Array<ShrugOff>} shrugOffs 
 */
export default class InjuryShrugOffBarViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.ACTOR_INJURY_SHRUG_OFF_BAR; }

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

    const shrugOffCount = this.document.health.injuryShrugOffs;
    const numToRender = 10;

    this.shrugOffs = [];
    for (let i = 0; i < numToRender; i++) {
      this.shrugOffs.push(new ShrugOff({
        id: `${this.id}-${i}`,
        active: i < shrugOffCount,
        value: i + 1,
      }));
    }
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    if (this.isEditable !== true) return;

    // Set up reset to 0. 
    html.find(`#${this.id}-shrug-off-0`).click(async (event) => {
      event.preventDefault();

      this.document.health.injuryShrugOffs = 0;
    });

    // Set up set to value of clicked element. 
    for (let i = 0; i < this.shrugOffs.length; i++) {
      const shrugOff = this.shrugOffs[i];
      html.find(`#${shrugOff.id}`).click(async (event) => {
        this.document.health.injuryShrugOffs = shrugOff.value;
      });
    }
  }
}

/**
 * @property {String} id Internal id of this shrug-off. 
 * @property {Number} value The represented shrug-off value. 
 * @property {Boolean} active If `true`, then this shrug-off is 
 * currently active / available to be spent. 
 */
export class ShrugOff {
  /**
   * @param {Object} args 
   * @param {String} args.id Internal id of this shrug-off. 
   * @param {Number} args.value The represented shrug-off value. 
   * @param {Boolean | undefined} args.active If `true`, then this shrug-off is 
   * currently active / available to be spent. 
   * * default `false`
   */
  constructor(args = {}) {
    ValidationUtil.validateOrThrow(args, ["id", "value"]);

    this.id = args.id;
    this.value = args.value;
    this.active = args.active ?? false;
  }
}
