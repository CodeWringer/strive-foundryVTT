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
    this.contextTemplate = args.contextTemplate ?? "skill-item-sheet";

    // Child view models. 
    const thiz = this;
    
    this.vmTfName = this.createChildViewModelTextField({
      id: "vmTfName",
      propertyOwner: thiz.item,
      propertyPath: "name",
      placeholder: "ambersteel.labels.name",
    });
    this.vmBtnSendToChat = this.createChildViewModelSendToChat({
      id: "vmBtnSendToChat",
      target: thiz.item,
    });
    this.vmDdRelatedAttribute = this.createChildViewModelDropDown({
      id: "vmDdRelatedAttribute",
      propertyOwner: thiz.item,
      propertyPath: "data.data.relatedAttribute",
      options: thiz.attributeOptions,
    });
    this.vmTfCategory = this.createChildViewModelTextField({
      id: "vmTfCategory",
      propertyOwner: thiz.item,
      propertyPath: "data.data.category",
      placeholder: "ambersteel.labels.category",
    });
    this.vmTaDescription = this.createChildViewModelTextArea({
      id: "vmTaDescription",
      propertyOwner: thiz.item,
      propertyPath: "data.data.description",
      placeholder: "ambersteel.labels.description",
      allowResize: true,
    });
    this.vmSkillAbilityTable = new SkillAbilityTableViewModel({
      id: "vmSkillAbilityTable",
      parent: thiz,
      isEditable: thiz.isEditable,
      isSendable: thiz.isSendable,
      isOwner: thiz.isOwner,
      isGM: thiz.isGM,
      item: thiz.item,
      skillAbilitiesInitiallyVisible: true,
      oneColumn: false,
      visGroupId: thiz.visGroupId,
      actor: thiz.actor,
    });
  }
}
