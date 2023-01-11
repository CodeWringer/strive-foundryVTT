import { isNotBlankOrUndefined } from "../../../business/util/validation-utility.mjs";
import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";
import ViewModel from "../../view-model/view-model.mjs";

export default class ActorChatMessageViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.ACTOR_CHAT_MESSAGE; }

  /** @override */
  get entityId() { return this.document.id; }

  get renderedBiography() { return TextEditor.enrichHTML(this.document.person.biography); }

  get renderedDescription() { return TextEditor.enrichHTML(this.document.description); }

  /**
   * Is true, if the actor is a player character. 
   * @type {Boolean}
   */
  get isPC() { return this.document.type === "pc"; }
  
  /**
   * Is true, if the actor is a non-player character. 
   * @type {Boolean}
   */
  get isNPC() { return this.document.type === "npc"; }

  /**
   * Is true, if the actor is a plain actor. 
   * @type {Boolean}
   */
  get isPlain() { return this.document.type === "plain"; }

  /***
   * @type {Boolean}
   * @readonly
   */
  get showSpecies() { return isNotBlankOrUndefined(this.document.person.species); }

  /***
   * @type {Boolean}
   * @readonly
   */
  get showCulture() { return isNotBlankOrUndefined(this.document.person.culture); }

  /***
   * @type {Boolean}
   * @readonly
   */
  get showSex() { return isNotBlankOrUndefined(this.document.person.sex); }

  /***
   * @type {Boolean}
   * @readonly
   */
  get showAge() { 
    const value = this.document.person.age;
    return value !== 0 && value !== "0" && isNotBlankOrUndefined(value);
  }

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
   * @param {TransientBaseActor} args.document
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["document"]);
    this.contextTemplate = args.contextTemplate ?? "actor-chat-message";
    
    this.document = args.document;
  }
}
