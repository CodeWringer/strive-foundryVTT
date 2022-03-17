import ButtonDeleteViewModel from "../../../module/components/button-delete/button-delete-viewmodel.mjs";
import ButtonRollViewModel from "../../../module/components/button-roll/button-roll-viewmodel.mjs";
import ButtonSendToChatViewModel from "../../../module/components/button-send-to-chat/button-send-to-chat-viewmodel.mjs";
import InputDropDownViewModel from "../../../module/components/input-dropdown/input-dropdown-viewmodel.mjs";
import InputNumberSpinnerViewModel from "../../../module/components/input-number-spinner/input-number-spinner-viewmodel.mjs";
import InputTextareaViewModel from "../../../module/components/input-textarea/input-textarea-viewmodel.mjs";
import InputTextFieldViewModel from "../../../module/components/input-textfield/input-textfield-viewmodel.mjs";
import { TEMPLATES } from "../../../module/templatePreloader.mjs";
import { validateOrThrow } from "../../../module/utils/validation-utility.mjs";
import SheetViewModel from "../../sheet-viewmodel.mjs";

export default class SkillAbilityListItemViewModel extends SheetViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.SKILL_ABILITY_LIST_ITEM; }

  /**
   * @type {Item}
   * @readonly
   */
  item = undefined;

  /**
   * @type {SkillAbility}
   * @readonly
   */
  get skillAbility() { return this.item.data.data.abilities[this.index] }

  /**
   * @type {Actor | undefined}
   * @readonly
   */
  actor = undefined;

  /**
   * @type {Number}
   * @readonly
   */
  index = -1;

  /**
   * @type {Array<ChoiceOption>}
   * @readonly
   */
  get attackTypeOptions() { return game.ambersteel.getAttackTypeOptions(); }

  /**
   * @type {Array<ChoiceOption>}
   * @readonly
   */
  get damageTypeOptions() { return game.ambersteel.getDamageTypeOptions(); }

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
   * @param {Actor | undefined} args.actor
   * @param {Number} args.index
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["item", "index"]);

    // Own properties.
    this.item = args.item;
    this.actor = args.actor;
    this.index = args.index;

    this.contextTemplate = "skill-ability-list-item";
    const thiz = this;
    const pathSkillAbility = `data.data.abilities[${thiz.index}]`;
    
    if (this.isSendable === true) {
      this.vmBtnSendToChat = new ButtonSendToChatViewModel({
        id: "vmBtnSendToChat",
        target: thiz.item,
        parent: thiz,
        propertyPath: pathSkillAbility,
      });
    }
    
    if (this.isEditable !== true) return;

    this.vmTfName = new InputTextFieldViewModel({
      id: "vmTfName",
      isEditable: thiz.isEditable,
      propertyOwner: thiz.item,
      propertyPath: `${pathSkillAbility}.name`,
      placeholder: "ambersteel.labels.name",
      contextTemplate: thiz.contextTemplate,
      parent: thiz,
    });
    this.vmBtnDelete = new ButtonDeleteViewModel({
      id: "vmBtnDelete",
      parent: thiz,
      target: thiz.item,
      propertyPath: pathSkillAbility,
      withDialog: true,
    });
    this.vmNsRequiredLevel = new InputNumberSpinnerViewModel({
      id: "vmNsRequiredLevel",
      isEditable: thiz.isEditable,
      propertyOwner: thiz.item,
      propertyPath: `${pathSkillAbility}.requiredLevel`,
      contextTemplate: thiz.contextTemplate,
      parent: thiz,
      min: 0,
    });
    this.vmTfObstacle = new InputTextFieldViewModel({
      id: "vmTfObstacle",
      isEditable: thiz.isEditable,
      propertyOwner: thiz.item,
      propertyPath: `${pathSkillAbility}.obstacle`,
      contextTemplate: thiz.contextTemplate,
      parent: thiz,
    });
    this.vmNsDistance = new InputNumberSpinnerViewModel({
      id: "vmNsDistance",
      isEditable: thiz.isEditable,
      propertyOwner: thiz.item,
      propertyPath: `${pathSkillAbility}.distance`,
      contextTemplate: thiz.contextTemplate,
      parent: thiz,
      min: 0,
    });
    this.vmNsApCost = new InputNumberSpinnerViewModel({
      id: "vmNsApCost",
      isEditable: thiz.isEditable,
      propertyOwner: thiz.item,
      propertyPath: `${pathSkillAbility}.apCost`,
      contextTemplate: thiz.contextTemplate,
      parent: thiz,
      min: 0,
    });
    this.vmDdAttackType = new InputDropDownViewModel({
      id: "vmDdAttackType",
      isEditable: thiz.isEditable,
      propertyOwner: thiz.item,
      propertyPath: `${pathSkillAbility}.attackType`,
      contextTemplate: thiz.contextTemplate,
      parent: thiz,
      options: thiz.attackTypeOptions,
    });
    this.vmBtnRollDamage = new ButtonRollViewModel({
      id: "vmBtnRollDamage",
      target: thiz.item,
      propertyPath: `${pathSkillAbility}.damageFormula`,
      rollType: "generic",
      chatTitle: thiz.skillAbility.name,
      actor: thiz.actor,
    });
    this.vmTfDamage = new InputTextFieldViewModel({
      id: "vmTfDamage",
      isEditable: thiz.isEditable,
      propertyOwner: thiz.item,
      propertyPath: `${pathSkillAbility}.damageFormula`,
      contextTemplate: thiz.contextTemplate,
      parent: thiz,
    });
    this.vmDdDamageType = new InputDropDownViewModel({
      id: "vmDdDamageType",
      isEditable: thiz.isEditable,
      propertyOwner: thiz.item,
      propertyPath: `${pathSkillAbility}.damageType`,
      contextTemplate: thiz.contextTemplate,
      parent: thiz,
      options: thiz.damageTypeOptions,
    });
    this.vmTfCondition = new InputTextFieldViewModel({
      id: "vmTfCondition",
      isEditable: thiz.isEditable,
      propertyOwner: thiz.item,
      propertyPath: `${pathSkillAbility}.condition`,
      contextTemplate: thiz.contextTemplate,
      parent: thiz,
    });
    this.vmTaDescription = new InputTextareaViewModel({
      id: "vmTaDescription",
      isEditable: thiz.isEditable,
      propertyPath: `${pathSkillAbility}.description`,
      propertyOwner: thiz.item,
      contextTemplate: thiz.contextTemplate,
      parent: thiz,
      placeholder: "ambersteel.labels.description",
      allowResize: true,
    });
  }
}
