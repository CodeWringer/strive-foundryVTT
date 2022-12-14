import { validateOrThrow } from "../../../../business/util/validation-utility.mjs";
import ViewModel from "../../../view-model/view-model.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";
import ActorBeliefsViewModel from "./actor-beliefs-viewmodel.mjs";
import ActorFateViewModel from "./actor-fate-viewmodel.mjs";

export default class ActorBeliefsFateViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.ACTOR_BELIEFS_FATE; }

  beliefsViewModel = undefined;
  get beliefsViewModelId() { return "child-beliefs-view-model"; }

  fateViewModel = undefined;
  get fateViewModelId() { return "child-fate-view-model"; }

  /**
   * @type {Actor}
   */
  actor = undefined;

  /** @override */
  get entityId() { return this.actor.id; }

  /**
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * 
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * @param {Boolean | undefined} args.isGM If true, the current user is a GM. 
   * 
   * @param {Actor} args.actor
   * 
   * @throws {Error} ArgumentException - Thrown, if any of the mandatory arguments aren't defined. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["actor"]);

    // Own properties.
    this.actor = args.actor;

    // Child view models. 
    const thiz = this;

    this.beliefsViewModel = new ActorBeliefsViewModel({ ...args, id: thiz.beliefsViewModelId, parent: thiz });
    this.fateViewModel = new ActorFateViewModel({ ...args, id: thiz.fateViewModelId, parent: thiz });
  }
}