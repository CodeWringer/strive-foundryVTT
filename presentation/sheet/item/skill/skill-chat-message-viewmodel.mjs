import { ATTRIBUTES } from "../../../../business/ruleset/attribute/attributes.mjs"
import { validateOrThrow } from "../../../../business/util/validation-utility.mjs"
import ButtonToggleVisibilityViewModel from "../../../component/button-toggle-visibility/button-toggle-visibility-viewmodel.mjs"
import InputPropertiesViewModel from "../../../component/input-properties/input-properties-viewmodel.mjs"
import LazyRichTextViewModel from "../../../component/lazy-rich-text/lazy-rich-text-viewmodel.mjs"
import { TEMPLATES } from "../../../templatePreloader.mjs"
import ViewModel from "../../../view-model/view-model.mjs"
import SkillAbilityChatMessageViewModel from "../skill-ability/skill-ability-chat-message-viewmodel.mjs"

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
   * @type {Boolean}
   * @readonly
   */
  get hasProperties() { return this.document.properties.length > 0; }

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
  
  /**
   * @type {String}
   * @readonly
   */
  get templateSkillAbility() { return TEMPLATES.SKILL_ABILITY_CHAT_MESSAGE; }

  /**
   * @type {Boolean}
   * @default false
   */
  skillAbilitiesInitiallyVisible = false;

  /**
   * @type {Array<SkillAbilityChatMessageViewModel>}
   */
  skillAbilityViewModels = [];

  /**
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 

   * @param {TransientSkill} args.document 
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * 
   * @param {String | undefined} args.visGroupId
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["document"]);
    this.contextTemplate = args.contextTemplate ?? "skill-chat-message";
    
    this.document = args.document;
    this.skillAbilityViewModels = this.document.abilities.map(it => it.getChatViewModel());

    this.vmBtnToggleVisibilityExpand = new ButtonToggleVisibilityViewModel({
      id: "vmBtnToggleVisibilityExpand",
      parent: this,
      isEditable: true,
      isSendable: this.isSendable,
      isOwner: this.isOwner,
      visGroup: `${this.id}-abilities`,
      toggleSelf: true,
    });
    this.vmBtnToggleVisibilityCollapse = new ButtonToggleVisibilityViewModel({
      id: "vmBtnToggleVisibilityCollapse",
      parent: this,
      isEditable: true,
      isSendable: this.isSendable,
      isOwner: this.isOwner,
      visGroup: `${this.id}-abilities`,
      toggleSelf: true,
    });
    this.vmLazyDescription = new LazyRichTextViewModel({
      id: "vmLazyDescription",
      parent: this,
      isEditable: this.isEditable,
      isSendable: this.isSendable,
      isOwner: this.isOwner,
      renderableContent: this.document.description,
    });
    this.vmProperties = new InputPropertiesViewModel({
      id: "vmProperties",
      parent: this,
      propertyPath: "properties",
      propertyOwner: this.document,
      isEditable: false,
    });
  }
}
