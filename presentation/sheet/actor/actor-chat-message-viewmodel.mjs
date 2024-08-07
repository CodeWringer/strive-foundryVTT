import { ACTOR_TYPES } from "../../../business/document/actor/actor-types.mjs";
import { isNotBlankOrUndefined } from "../../../business/util/validation-utility.mjs";
import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import LazyRichTextViewModel from "../../component/lazy-rich-text/lazy-rich-text-viewmodel.mjs";
import ViewModel from "../../view-model/view-model.mjs";

export default class ActorChatMessageViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.ACTOR_CHAT_MESSAGE; }

  /** @override */
  get entityId() { return this.document.id; }

  /**
   * Is true, if the actor is a player character. 
   * @type {Boolean}
   */
  get isPC() { return this.document.type === ACTOR_TYPES.PC; }
  
  /**
   * Is true, if the actor is a non-player character. 
   * @type {Boolean}
   */
  get isNPC() { return this.document.type === ACTOR_TYPES.NPC; }

  /**
   * Is true, if the actor is a plain actor. 
   * @type {Boolean}
   */
  get isPlain() { return this.document.type === ACTOR_TYPES.PLAIN; }

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
    const age = this.document.person.age;
    return age !== 0 && age !== "0" && isNotBlankOrUndefined(age);
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
    if (this.isNPC === true) {
      if (this.document.isChallengeRatingEnabled) {
        this.challengeRating = this.document.challengeRating;
      }
    }

    if (this.document.type !== ACTOR_TYPES.PLAIN) {
      this.vmLazyBiography = new LazyRichTextViewModel({
        id: "vmLazyBiography",
        parent: this,
        isEditable: this.isEditable,
        isSendable: this.isSendable,
        isOwner: this.isOwner,
        renderableContent: this.document.person.biography,
      });
    } else {
      this.vmLazyDescription = new LazyRichTextViewModel({
        id: "vmLazyDescription",
        parent: this,
        isEditable: this.isEditable,
        isSendable: this.isSendable,
        isOwner: this.isOwner,
        renderableContent: this.document.description,
      });
    }
  }
}
