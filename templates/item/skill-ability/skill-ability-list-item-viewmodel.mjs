import SheetViewModel from "../../../module/components/sheet-viewmodel.mjs";
import { TEMPLATES } from "../../../module/templatePreloader.mjs";
import { validateOrThrow } from "../../../module/utils/validation-utility.mjs";

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

    this.item = args.item;
    this.actor = args.actor;
    this.index = args.index;
    this.contextTemplate = args.contextTemplate ?? "skill-ability-list-item";

    const thiz = this;
    const pathSkillAbility = `data.data.abilities[${thiz.index}]`;
    
    if (this.isSendable === true) {
      this.vmBtnSendToChat = this.createVmBtnSendToChat({
        id: "vmBtnSendToChat",
        target: thiz.item,
        propertyPath: pathSkillAbility,
      });
    }
    
    this.vmImg = this.createVmImg({
      id: "vmImg",
      propertyOwner: thiz.item,
      propertyPath: `${pathSkillAbility}.img`,
    });
    this.vmTfName = this.createVmTextField({
      id: "vmTfName",
      propertyOwner: thiz.item,
      propertyPath: `${pathSkillAbility}.name`,
      placeholder: "ambersteel.labels.name",
    });
    this.vmBtnDelete = this.createVmBtnDelete({
      id: "vmBtnDelete",
      target: thiz.item,
      propertyPath: pathSkillAbility,
      withDialog: true,
    });
    this.vmNsRequiredLevel = this.createVmNumberSpinner({
      id: "vmNsRequiredLevel",
      propertyOwner: thiz.item,
      propertyPath: `${pathSkillAbility}.requiredLevel`,
      min: 0,
    });
    this.vmTfObstacle = this.createVmTextField({
      id: "vmTfObstacle",
      propertyOwner: thiz.item,
      propertyPath: `${pathSkillAbility}.obstacle`,
    });
    this.vmNsDistance = this.createVmNumberSpinner({
      id: "vmNsDistance",
      propertyOwner: thiz.item,
      propertyPath: `${pathSkillAbility}.distance`,
      min: 0,
    });
    this.vmNsApCost = this.createVmNumberSpinner({
      id: "vmNsApCost",
      propertyOwner: thiz.item,
      propertyPath: `${pathSkillAbility}.apCost`,
      min: 0,
    });
    this.vmDdAttackType = this.createVmDropDown({
      id: "vmDdAttackType",
      propertyOwner: thiz.item,
      propertyPath: `${pathSkillAbility}.attackType`,
      options: thiz.attackTypeOptions,
    });
    this.vmBtnRollDamage = this.createVmBtnRoll({
      id: "vmBtnRollDamage",
      target: thiz.item,
      propertyPath: `${pathSkillAbility}.damageFormula`,
      rollType: "generic",
      chatTitle: thiz.skillAbility.name,
      actor: thiz.actor,
    });
    this.vmTfDamage = this.createVmTextField({
      id: "vmTfDamage",
      propertyOwner: thiz.item,
      propertyPath: `${pathSkillAbility}.damageFormula`,
    });
    this.vmDdDamageType = this.createVmDropDown({
      id: "vmDdDamageType",
      propertyOwner: thiz.item,
      propertyPath: `${pathSkillAbility}.damageType`,
      options: thiz.damageTypeOptions,
    });
    this.vmTfCondition = this.createVmTextField({
      id: "vmTfCondition",
      propertyOwner: thiz.item,
      propertyPath: `${pathSkillAbility}.condition`,
    });
    this.vmTaDescription = this.createVmTextArea({
      id: "vmTaDescription",
      propertyPath: `${pathSkillAbility}.description`,
      propertyOwner: thiz.item,
      placeholder: "ambersteel.labels.description",
      allowResize: true,
    });
  }
}
