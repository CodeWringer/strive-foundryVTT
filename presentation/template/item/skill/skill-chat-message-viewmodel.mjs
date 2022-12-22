import { ATTRIBUTES } from "../../../../business/ruleset/attribute/attributes.mjs";
import { validateOrThrow } from "../../../../business/util/validation-utility.mjs";
import ViewModel from "../../../view-model/view-model.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";
import SkillAbilityTableViewModel from "../skill-ability/skill-ability-table-viewmodel.mjs";

export default class SkillChatMessageViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.SKILL_ITEM_CHAT_MESSAGE; }

  /** @override */
  get entityId() { return this.document.id; }

  /**
   * @type {Boolean}
   * @readonly
   */
  get hasAbilities() { return this.document.abilities.length !== 0; }

  /**
   * @type {String}
   * @readonly
   */
  get visGroupId() { return `${this.id}-skill-ability-table-visgroup`; }
  
  /**
   * @type {String}
   * @readonly
   */
  get relatedAttribute() {
    const options = ATTRIBUTES.asChoices;
    return options.find(it => { return it.value === this.document.relatedAttribute.name }).localizedValue;
  }

  get description() { return TextEditor.enrichHTML(this.document.description); }

  /**
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 

   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * @param {Boolean | undefined} args.isGM If true, the current user is a GM. 
   * 
   * @param {TransientSkill} args.document
   * @param {String | undefined} args.visGroupId
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["document"]);
    this.contextTemplate = args.contextTemplate ?? "skill-chat-message";
    
    this.document = args.document;
    
    // Child view models. 
    const thiz = this;

    this.vmSkillAbilityTable = new SkillAbilityTableViewModel({
      id: "vmSkillAbilityTable",
      parent: thiz,
      isEditable: thiz.isEditable,
      isSendable: thiz.isSendable,
      isOwner: thiz.isOwner,
      isGM: thiz.isGM,
      document: thiz.document,
      skillAbilitiesInitiallyVisible: false,
      oneColumn: true,
      visGroupId: thiz.visGroupId,
    });
  }
}
