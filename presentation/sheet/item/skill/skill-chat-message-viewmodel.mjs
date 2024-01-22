import TransientSkill from "../../../../business/document/item/skill/transient-skill.mjs"
import { ATTRIBUTES } from "../../../../business/ruleset/attribute/attributes.mjs"
import { validateOrThrow } from "../../../../business/util/validation-utility.mjs"
import ButtonToggleVisibilityViewModel from "../../../component/button-toggle-visibility/button-toggle-visibility-viewmodel.mjs"
import InputTagsViewModel from "../../../component/input-tags/input-tags-viewmodel.mjs"
import LazyRichTextViewModel from "../../../component/lazy-rich-text/lazy-rich-text-viewmodel.mjs"
import { TEMPLATES } from "../../../templatePreloader.mjs"
import ViewModel from "../../../view-model/view-model.mjs"
import ExpertiseChatMessageViewModel from "../expertise/expertise-chat-message-viewmodel.mjs"

export default class SkillChatMessageViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.SKILL_ITEM_CHAT_MESSAGE; }

  /** @override */
  get entityId() { return this.document.id; }

  /**
   * @type {Boolean}
   * @readonly
   */
  get hasExpertises() { return this.document.expertises.length !== 0; }
  
  /**
   * @type {Boolean}
   * @readonly
   */
  get hasTags() { return this.document.tags.length > 0; }

  /**
   * @type {String}
   * @readonly
   */
  get visGroupId() { return `${this.id}-expertise-table-visgroup`; }
  
  /**
   * @type {String}
   * @readonly
   */
  get baseAttributes() {
    const baseAttributeAbbreviations = this.document.baseAttributes.map(attribute => game.i18n.localize(attribute.localizableAbbreviation));
    return `(${baseAttributeAbbreviations.join(" / ")})`;
  }
  
  /**
   * @type {String}
   * @readonly
   */
  get templateExpertise() { return TEMPLATES.EXPERTISE_CHAT_MESSAGE; }

  /**
   * Returns true, if the list of prerequisites should be rendered. 
   * @type {Boolean}
   * @readonly
   */
  get showPrerequisites() { return this.document.prerequisites !== undefined && this.document.prerequisites.length > 0; }

  /**
   * @type {Array<Object>}
   * @readonly
   */
  get prerequisites() {
    return this.document.prerequisites.map(it => {
      return {
        id: it.id,
        name: it.name,
        minimumLevel: it.minimumLevel,
      };
    });
  }

  /**
   * @type {Boolean}
   * @readonly
   */
  get showDamage() { return this.document.damage.length > 0 }

  /**
   * @type {Boolean}
   * @default false
   */
  expertisesInitiallyVisible = false;

  /**
   * @type {Array<ExpertiseChatMessageViewModel>}
   */
  expertiseViewModels = [];

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

    this.expertiseViewModels = this.document.expertises.map(it => it.getChatViewModel({
      id: it.id,
      parent: this,
      showParentSkill: false,
    }));

    this.vmBtnToggleVisibilityExpand = new ButtonToggleVisibilityViewModel({
      id: "vmBtnToggleVisibilityExpand",
      parent: this,
      isEditable: true,
      isSendable: this.isSendable,
      isOwner: this.isOwner,
      visGroup: `${this.id}-expertises`,
      toggleSelf: true,
    });
    this.vmBtnToggleVisibilityCollapse = new ButtonToggleVisibilityViewModel({
      id: "vmBtnToggleVisibilityCollapse",
      parent: this,
      isEditable: true,
      isSendable: this.isSendable,
      isOwner: this.isOwner,
      visGroup: `${this.id}-expertises`,
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
    this.vmTags = new InputTagsViewModel({
      id: "vmTags",
      parent: this,
      value: this.document.tags,
      onChange: (_, newValue) => {
        this.document.tags = newValue;
      },
      isEditable: false,
    });
  }
}
