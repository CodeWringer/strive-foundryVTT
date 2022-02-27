import { TEMPLATES } from "../../../module/templatePreloader.mjs";
import SkillAbilityTableViewModel from "../skill-ability/skill-ability-table-viewmodel.mjs";
import SkillViewModel from "./skill-viewmodel.mjs";

export default class SkillChatMessageViewModel extends SkillViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.SKILL_ITEM_CHAT_MESSAGE; }

  /**
   * @type {Boolean}
   */
  get hasAbilities() { return this.item.data.data.abilities.length !== 0; }

  skillAbilityTableViewModel = undefined;
  get skillAbilityTableId() { return "skill-ability-table"; }

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
   * @param {Item} item
   * @param {Actor | undefined} actor If not undefined, this is the actor that owns the item. 
   * @param {String | undefined} visGroupId
   */
  constructor(args = {}) {
    super(args);

    // Child view models. 
    const thiz = this;

    this.skillAbilityTableViewModel = new SkillAbilityTableViewModel({ ...args, id: thiz.skillAbilityTableId, parent: thiz });
  }
}
