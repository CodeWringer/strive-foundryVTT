import { validateOrThrow } from "../../../../business/util/validation-utility.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";
import SkillAbilityTableViewModel from "../skill-ability/skill-ability-table-viewmodel.mjs";
import SkillViewModel from "./skill-viewmodel.mjs";
import ViewModelFactory from "../../../view-model/view-model-factory.mjs";
import { ATTRIBUTES } from "../../../../business/ruleset/attributes.mjs";

export default class SkillListItemViewModel extends SkillViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.SKILL_LIST_ITEM; }

  /**
   * @type {Array<ChoiceOption>}
   * @readonly
   */
  get attributeOptions() { return ATTRIBUTES.asChoices; }

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
    const factory = new ViewModelFactory();

    this.vmImg = factory.createVmImg({
      parent: thiz,
      id: "vmImg",
      propertyOwner: thiz.item,
      propertyPath: "img",
    });
    this.vmTfName = factory.createVmTextField({
      parent: thiz,
      id: "vmTfName",
      propertyOwner: thiz.item,
      propertyPath: "name",
      placeholder: "ambersteel.general.name",
    });
    this.vmBtnRoll = factory.createVmBtnRoll({
      parent: thiz,
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
    this.vmBtnSendToChat = factory.createVmBtnSendToChat({
      parent: thiz,
      id: "vmBtnSendToChat",
      target: thiz.item,
    });
    this.vmBtnDelete = factory.createVmBtnDelete({
      parent: thiz,
      id: "vmBtnDelete",
      target: thiz.item,
      withDialog: true,
    })
    this.vmDdRelatedAttribute = factory.createVmDropDown({
      parent: thiz,
      id: "vmDdRelatedAttribute",
      propertyOwner: thiz.item,
      propertyPath: "data.data.relatedAttribute",
      options: thiz.attributeOptions,
    });
    this.vmTfCategory = factory.createVmTextField({
      parent: thiz,
      id: "vmTfCategory",
      propertyOwner: thiz.item,
      propertyPath: "data.data.category",
    });
    this.vmNsLevel = factory.createVmNumberSpinner({
      parent: thiz,
      id: "vmNsLevel",
      propertyOwner: thiz.item,
      propertyPath: "data.data.level",
      min: 0,
    });
    this.vmNsSuccesses = factory.createVmNumberSpinner({
      parent: thiz,
      id: "vmNsSuccesses",
      propertyOwner: thiz.item,
      propertyPath: "data.data.successes",
      min: 0,
    });
    this.vmNsFailures = factory.createVmNumberSpinner({
      parent: thiz,
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
    this.vmSwIsMagicSchool = factory.createVmBtnToggle({
      parent: thiz,
      id: "vmSwIsMagicSchool",
      target: thiz.item,
      propertyPath: "data.data.isMagicSchool",
    });
    this.vmRtDescription = factory.createVmRichText({
      parent: thiz,
      id: "vmRtDescription",
      propertyOwner: thiz.item,
      propertyPath: "data.data.description",
    });
  }
}
