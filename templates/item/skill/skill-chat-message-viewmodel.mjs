import { TEMPLATES } from "../../../module/templatePreloader.mjs";
import ChatMessageViewModel from "../../chat-message-viewmodel.mjs";
import SkillAbilityTableViewModel from "../skill-ability/skill-ability-table-viewmodel.mjs";

export default class SkillChatMessageViewModel extends ChatMessageViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.SKILL_ITEM_CHAT_MESSAGE; }

  /**
   * @type {Boolean}
   */
  get hasAbilities() { return this.item.data.data.abilities.length !== 0; }

  get visGroupId() { return `${this.id}-skill-ability-table-visgroup`; }

  /**
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * 
   * @param {Boolean | undefined} isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} isOwner If true, the current user is the owner of the represented document. 
   * @param {Boolean | undefined} isGM If true, the current user is a GM. 
   * 
   * @param {Item} item
   * @param {Actor | undefined} actor If not undefined, this is the actor that owns the item. 
   * @param {String | undefined} visGroupId
   */
  constructor(args = {}) {
    super(args);

    // Child view models. 
    this.contextTemplate = "skill-chat-message";
    const thiz = this;

    this.vmSkillAbilityTable = new SkillAbilityTableViewModel({
      id: "vmSkillAbilityTable",
      parent: thiz,
      item: thiz.item,
      skillAbilitiesInitiallyVisible: false,
      oneColumn: true,
      visGroupId: thiz.visGroupId,
      actor: thiz.actor,
    });
  }
}
