import SheetViewModel from "../../module/components/sheet-viewmodel.mjs";
import { TEMPLATES } from "../../module/templatePreloader.mjs";
import { validateOrThrow } from "../../module/utils/validation-utility.mjs";

export default class ActorChatMessageViewModel extends SheetViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.ACTOR_CHAT_MESSAGE; }

  get renderedBiography() { return TextEditor.enrichHTML(this.actor.data.data.biography); }

  get renderedDescription() { return TextEditor.enrichHTML(this.actor.data.data.description); }

  /**
   * Is true, if the actor is a player character. 
   * @type {Boolean}
   */
  get isPC() { return this.actor.type === "pc"; }
  
  /**
   * Is true, if the actor is a non-player character. 
   * @type {Boolean}
   */
  get isNPC() { return this.actor.type === "npc"; }

  /**
   * Is true, if the actor is a plain actor. 
   * @type {Boolean}
   */
  get isPlain() { return this.actor.type === "plain"; }

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
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["actor"]);
    this.contextTemplate = args.contextTemplate ?? "actor-chat-message";
    
    this.actor = args.actor;
  }
}
