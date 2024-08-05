import TransientPc from "../../../../../../business/document/actor/transient-pc.mjs";
import { validateOrThrow } from "../../../../../../business/util/validation-utility.mjs";
import { TEMPLATES } from "../../../../../templatePreloader.mjs";
import ViewModel from "../../../../../view-model/view-model.mjs";

/**
 * 
 * @property {Array<Object>} deathSaves 
 * 
 * @extends ViewModel
 */
export default class DeathsDoorViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.ACTOR_HEALTH_DEATH_SAVES; }

  /**
   * @type {Boolean}
   * @readonly
   */
  get isDeathNear() { return this.document.health.HP <= 0; }

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
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat.
   * * Default `false`. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document.
   * * Default `false`. 
   * 
   * @param {TransientPc} args.document
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["document"]);

    this.document = args.document;

    this.deathSaves = [];
    for (let i = 0; i < this.document.health.deathSaveLimit; i++) {
      this.deathSaves.push({
        id: `${this.id}-death-save-${i}`,
        value: i + 1 <= this.document.health.deathSaves,
      });
    }
  }

  
  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    if (this.isEditable !== true) return;

    // Set up reset to 0. 
    html.find(`#${this.id}-grit-point-0`).click(async (event) => {
      event.preventDefault();

      this.document.deathSaves = 0;
    });

    // Set up set to value of clicked element. 
    for (let i = 0; i < this.deathSaves.length; i++) {
      html.find(`#${this.id}-death-save-${i}`).click(async (event) => {
        if (this.document.health.deathSaves === i + 1) {
          this.document.health.deathSaves = i;
        } else {
          this.document.health.deathSaves = i + 1;
        }
      });
    }
  }
}
