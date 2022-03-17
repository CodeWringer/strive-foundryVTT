import { TEMPLATES } from "../../../module/templatePreloader.mjs";
import { validateOrThrow } from "../../../module/utils/validation-utility.mjs";
import ChatMessageViewModel from "../../chat-message-viewmodel.mjs";

export default class SkillAbilityChatMessageViewModel extends ChatMessageViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.SKILL_ABILITY_CHAT_MESSAGE; }

  /**
   * @type {Item}
   */
  item = undefined;

  /**
   * @type {SkillAbility}
   */
  skillAbility = undefined;

  /**
   * @type {Actor}
   */
  actor = undefined;

  /**
   * @type {Number}
   * @readonly
   */
  index = -1;

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
   * @param {Item} args.item
   * @param {SkillAbility} args.skillAbility
   * @param {Actor} args.actor
   * @param {Number} args.index
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["item", "skillAbility", "actor"]);

    // Own properties.
    this.item = args.item;
    this.skillAbility = args.skillAbility;
    this.actor = args.actor;
    this.index = args.index;
  }
}
