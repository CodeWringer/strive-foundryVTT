import { TEMPLATES } from "../../../module/templatePreloader.mjs";
import { validateOrThrow } from "../../../module/utils/validation-utility.mjs";
import SkillAbilityTableViewModel from "../skill-ability/skill-ability-table-viewmodel.mjs";
import SkillViewModel from "./skill-viewmodel.mjs";

export default class SkillListItemViewModel extends SkillViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.SKILL_LIST_ITEM; }

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
   * Returns the current number of successes. 
   * @type {Number}
   * @readonly
   */
  get requiredSuccessses() { return this.item.data.data.requiredSuccessses; }

  /**
   * Returns the current number of failures. 
   * @type {Number}
   * @readonly
   */
  get requiredFailures() { return this.item.data.data.requiredFailures; }

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
    this.contextTemplate = args.contextTemplate ?? "skill-list-item";

    // Child view models. 
    const thiz = this;
    
    this.vmImg = this.createVmImg({
      id: "vmImg",
      propertyOwner: thiz.item,
      propertyPath: "img",
    });
    this.vmTfName = this.createVmTextField({
      id: "vmTfName",
      propertyOwner: thiz.item,
      propertyPath: "name",
      placeholder: "ambersteel.general.name",
    });
    this.vmBtnRoll = thiz.createVmBtnRoll({
      id: "vmBtnRoll",
      target: thiz.item,
      propertyPath: undefined,
      primaryChatTitle: game.i18n.localize(thiz.item.name),
      primaryChatImage: thiz.item.img,
      rollType: "dice-pool",
      callback: "advanceSkillBasedOnRollResult",
      callbackData: thiz.item.id,
      actor: thiz.actor,
    })
    this.vmBtnSendToChat = this.createVmBtnSendToChat({
      id: "vmBtnSendToChat",
      target: thiz.item,
    });
    this.vmBtnDelete = this.createVmBtnDelete({
      id: "vmBtnDelete",
      target: thiz.item,
      withDialog: true,
    })
    this.vmDdRelatedAttribute = this.createVmDropDown({
      id: "vmDdRelatedAttribute",
      propertyOwner: thiz.item,
      propertyPath: "data.data.relatedAttribute",
      options: thiz.attributeOptions,
    });
    this.vmTfCategory = this.createVmTextField({
      id: "vmTfCategory",
      propertyOwner: thiz.item,
      propertyPath: "data.data.category",
    });
    this.vmNsLevel = this.createVmNumberSpinner({
      id: "vmNsLevel",
      propertyOwner: thiz.item,
      propertyPath: "data.data.value",
      min: 0,
    });
    this.vmNsSuccesses = this.createVmNumberSpinner({
      id: "vmNsSuccesses",
      propertyOwner: thiz.item,
      propertyPath: "data.data.successes",
      min: 0,
    });
    this.vmNsFailures = this.createVmNumberSpinner({
      id: "vmNsFailures",
      propertyOwner: thiz.item,
      propertyPath: "data.data.failures",
      min: 0,
    });
    this.vmSkillAbilityTable = new SkillAbilityTableViewModel({
      id: "vmSkillAbilityTable",
      parent: thiz,
      isEditable: thiz.isEditable,
      isSendable: thiz.isSendable,
      isOwner: thiz.isOwner,
      isGM: thiz.isGM,
      item: thiz.item,
      skillAbilitiesInitiallyVisible: false,
      oneColumn: false,
      visGroupId: thiz.visGroupId,
      actor: thiz.actor,
    });
    this.vmSwIsMagicSchool = this.createVmBtnToggle({
      id: "vmSwIsMagicSchool",
      target: thiz.item,
      propertyPath: "data.data.isMagicSchool",
    });
    this.vmRtDescription = this.createVmRichText({
      id: "vmRtDescription",
      propertyOwner: thiz.item,
      propertyPath: "data.data.description",
    });
  }
}
