import SheetViewModel from "../../../module/components/sheet-viewmodel.mjs";
import { TEMPLATES } from "../../../module/templatePreloader.mjs";
import { validateOrThrow } from "../../../module/utils/validation-utility.mjs";
import SkillAbilityTableViewModel from "../skill-ability/skill-ability-table-viewmodel.mjs";

export default class SkillChatMessageViewModel extends SheetViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.SKILL_ITEM_CHAT_MESSAGE; }

  /** @override */
  get entityId() { return this.item.id; }

  /**
   * @type {Boolean}
   */
  get hasAbilities() { return this.item.data.data.abilities.length !== 0; }

  get visGroupId() { return `${this.id}-skill-ability-table-visgroup`; }

  get relatedAttribute() {
    const options = game.ambersteel.getAttributeOptions();
    return options.find(it => { return it.value === this.item.data.data.relatedAttribute }).localizedValue;
  }

  get description() { return TextEditor.enrichHTML(this.item.data.data.description); }

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
   * @param {Actor | undefined} args.actor If not undefined, this is the actor that owns the item. 
   * @param {String | undefined} args.visGroupId
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["item"]);
    this.contextTemplate = args.contextTemplate ?? "skill-chat-message";
    
    this.item = args.item;
    
    // Child view models. 
    const thiz = this;

    this.vmSkillAbilityTable = new SkillAbilityTableViewModel({
      id: "vmSkillAbilityTable",
      parent: thiz,
      isEditable: thiz.isEditable,
      isSendable: thiz.isSendable,
      isOwner: thiz.isOwner,
      isGM: thiz.isGM,
      item: thiz.item,
      skillAbilitiesInitiallyVisible: false,
      oneColumn: true,
      visGroupId: thiz.visGroupId,
      actor: thiz.actor,
    });
  }
}
