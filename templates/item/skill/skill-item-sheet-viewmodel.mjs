import ButtonSendToChatViewModel from "../../../module/components/button-send-to-chat/button-send-to-chat-viewmodel.mjs";
import InputDropDownViewModel from "../../../module/components/input-dropdown/input-dropdown-viewmodel.mjs";
import InputTextareaViewModel from "../../../module/components/input-textarea/input-textarea-viewmodel.mjs";
import InputTextFieldViewModel from "../../../module/components/input-textfield/input-textfield-viewmodel.mjs";
import { TEMPLATES } from "../../../module/templatePreloader.mjs";
import SkillAbilityTableViewModel from "../skill-ability/skill-ability-table-viewmodel.mjs";
import SkillViewModel from "./skill-viewmodel.mjs";

export default class SkillItemSheetViewModel extends SkillViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.SKILL_ITEM_SHEET; }

  /**
   * @type {Array<ChoiceOption>}
   * @readonly
   */
  get attributeOptions() { return game.ambersteel.getAttributeOptions(); }
  
  /**
   * Returns true, if the skill ability list should be visible. 
   * @type {Boolean}
   * @readonly
   */
  get isSkillAbilityListVisible() { return (this.isEditable === true) || this.item.data.data.abilities.length !== 0 }

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

    // Child view models. 
    this.contextTemplate = "skill-item-sheet";
    const thiz = this;
    
    this.vmTfName = new InputTextFieldViewModel({
      id: "vmTfName",
      isEditable: thiz.isEditable,
      propertyOwner: thiz.item,
      propertyPath: "name",
      placeholder: "ambersteel.labels.name",
      contextTemplate: thiz.contextTemplate,
      parent: thiz,
    });
    this.vmBtnSendToChat = new ButtonSendToChatViewModel({
      id: "vmBtnSendToChat",
      target: thiz.item,
      parent: thiz,
    });
    this.vmDdRelatedAttribute = new InputDropDownViewModel({
      id: "vmDdRelatedAttribute",
      isEditable: thiz.isEditable,
      propertyOwner: thiz.item,
      propertyPath: "data.data.relatedAttribute",
      contextTemplate: thiz.contextTemplate,
      parent: thiz,
      options=thiz.attributeOptions,
    });
    this.vmTfCategory = new InputTextFieldViewModel({
      id: "vmTfCategory",
      isEditable: thiz.isEditable,
      propertyOwner: thiz.item,
      propertyPath: "data.data.category",
      contextTemplate: thiz.contextTemplate,
      parent: thiz,
    });
    this.vmTaDescription = new InputTextareaViewModel({
      id: "vmTaDescription",
      isEditable: thiz.isEditable,
      propertyPath: "data.data.description",
      propertyOwner: thiz.item,
      contextTemplate: thiz.contextTemplate,
      parent: thiz,
      placeholder: "ambersteel.labels.description",
      allowResize: true,
    });
    this.vmSkillAbilityTable = new SkillAbilityTableViewModel({
      id: "vmSkillAbilityTable",
      parent: thiz,
      item: thiz.item,
      skillAbilitiesInitiallyVisible: true,
      oneColumn: false,
      visGroupId: thiz.visGroupId,
      actor: thiz.actor,
    });
  }
}
