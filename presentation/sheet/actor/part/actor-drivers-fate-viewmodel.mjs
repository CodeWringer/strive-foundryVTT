import { validateOrThrow } from "../../../../business/util/validation-utility.mjs"
import { TEMPLATES } from "../../../templatePreloader.mjs"
import ViewModel from "../../../view-model/view-model.mjs"
import ActorDriversViewModel from "./actor-drivers-viewmodel.mjs"
import ActorFateViewModel from "./actor-fate-viewmodel.mjs"

export default class ActorDriversFateViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.ACTOR_DRIVERS_FATE; }

  /** @override */
  get entityId() { return this.document.id; }

  /**
   * @type {String}
   * @readonly
   */
  get driversTemplate() { return TEMPLATES.ACTOR_DRIVERS; }

  /**
   * @type {String}
   * @readonly
   */
  get fateTemplate() { return TEMPLATES.ACTOR_FATE; }

  /**
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * 
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * 
   * @param {TransientBaseCharacterActor} args.document
   * 
   * @throws {Error} ArgumentException - Thrown, if any of the mandatory arguments aren't defined. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["document"]);

    // Own properties.
    this.document = args.document;

    // Child view models. 
    const thiz = this;

    this.driversViewModel = new ActorDriversViewModel({
      ...args,
      id: "drivers",
      parent: thiz
    });
    this.fateViewModel = new ActorFateViewModel({
      ...args,
      id: "fate",
      parent: thiz
    });
  }
}
