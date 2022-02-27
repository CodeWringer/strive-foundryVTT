import { TEMPLATES } from "../../templatePreloader.mjs";
import ViewModel from "../../module/components/viewmodel.mjs";
import SheetViewModel from "../sheet-viewmodel.mjs";
import FateCardViewModel from "../../item/fate-card/fate-card-viewmodel.mjs";

export default class ActorFateViewModel extends SheetViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.ACTOR_FATE; }

  /**
   * @type {Actor}
   */
  actor = undefined;

  /**
   * @type {Number}
   * @readonly
   */
  get fateCardCount() { return this.actor.fateCards.length; }

  /**
   * @type {Array<FateCardViewModel>}
   * @readonly
   */
  fateCards = [];

  get remainingSlots() { return this.actor.data.data.fateSystem.remainingSlots; }

  /**
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * 
   * @param {Boolean} isEditable If true, the sheet is editable. 
   * @param {Boolean} isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean} isOwner If true, the current user is the owner of the represented document. 
   * @param {Boolean} isGM If true, the current user is a GM. 
   * 
   * @param {Actor} actor
   */
  constructor(args = {}) {
    super(args);

    // Own properties.
    this.actor = args.actor;

    // Child view models. 
    const thiz = this;

    for (const fateCard of this.actor.fateCards) {
      const vm = new FateCardViewModel({ ...args, id: fateCard.id, parent: thiz });
      this.fateCards.push(vm);
    }
  }
}
