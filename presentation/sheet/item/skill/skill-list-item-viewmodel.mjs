import { SKILL_HEAD_STATES } from "../../../../business/document/item/transient-skill.mjs"
import { ATTRIBUTES } from "../../../../business/ruleset/attribute/attributes.mjs"
import { SKILL_TAGS } from "../../../../business/tags/system-tags.mjs"
import { validateOrThrow } from "../../../../business/util/validation-utility.mjs"
import { isDefined } from "../../../../business/util/validation-utility.mjs"
import ButtonCheckBoxViewModel from "../../../component/button-checkbox/button-checkbox-viewmodel.mjs"
import ButtonViewModel from "../../../component/button/button-viewmodel.mjs"
import ChoiceAdapter from "../../../component/input-choice/choice-adapter.mjs"
import InputTagsViewModel from "../../../component/input-tags/input-tags-viewmodel.mjs"
import { TEMPLATES } from "../../../templatePreloader.mjs"
import ViewModelFactory from "../../../view-model/view-model-factory.mjs"
import SkillAbilityTableViewModel from "../skill-ability/skill-ability-table-viewmodel.mjs"
import { querySkillConfiguration } from "./skill-utils.mjs"
import SkillViewModel from "./skill-viewmodel.mjs"

export default class SkillListItemViewModel extends SkillViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.SKILL_LIST_ITEM; }

  /**
   * @type {Array<ChoiceOption>}
   * @readonly
   */
  get attributeOptions() { return ATTRIBUTES.asChoices(); }

  /**
   * Returns true, if the skill ability list should be visible. 
   * @type {Boolean}
   * @readonly
   */
  get isSkillAbilityListVisible() { return (this.isEditable === true) || this.document.abilities.length !== 0 }

  /**
   * Returns the current number of successes. 
   * @type {Number}
   * @readonly
   */
  get successes() { return this.document.advancementRequirements.successes; }

  /**
   * Returns the current number of failures. 
   * @type {Number}
   * @readonly
   */
  get failures() { return this.document.advancementRequirements.failures; }

  /**
   * Returns true, if the skill ability list should be rendered. 
   * @type {Boolean}
   * @readonly
   */
  get showSkillAbilities() { return this.isEditable === true || this.document.abilities.length > 0; }
  
  /**
   * Returns true, if the level should be rendered. 
   * @type {Boolean}
   * @readonly
   */
  get showLevel() { return this.document.headState.name === SKILL_HEAD_STATES.FULL.name 
    || this.document.headState.name === SKILL_HEAD_STATES.LEVEL_ONLY.name
    || this.document.headState.name === SKILL_HEAD_STATES.BASICS.name; }
  
  /**
   * Returns true, if the list of prerequisites should be rendered. 
   * @type {Boolean}
   * @readonly
   */
  get showPrerequisites() { return this.document.prerequisites !== undefined && this.document.prerequisites.length > 0; }

  /**
   * Returns true, if advanced data should be rendered. 
   * 
   * This entails: 
   * * modified level
   * * advancement requirements
   * * advancement progress
   * * description
   * * tags list
   * * category
   * @type {Boolean}
   * @readonly
   */
  get showAdvancedData() { return this.document.headState.name === SKILL_HEAD_STATES.FULL.name; }

  /**
   * Returns true, if related attribute should be rendered. 
   * 
   * @type {Boolean}
   * @readonly
   */
  get showRelatedAttribute() { return this.document.headState.name === SKILL_HEAD_STATES.FULL.name 
    || this.document.headState.name === SKILL_HEAD_STATES.BASICS.name; }

  /**
   * @type {Number}
   * @readonly
   */
  get modifiedLevel() { return this.document.modifiedLevel; }
  
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
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * 
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
    this.contextTemplate = args.contextTemplate ?? "skill-list-item";

    // Child view models. 
    const thiz = this;
    const factory = new ViewModelFactory();

    this.vmImg = factory.createVmImg({
      parent: thiz,
      id: "vmImg",
      propertyOwner: thiz.document,
      propertyPath: "img",
    });
    this.vmTfName = factory.createVmTextField({
      parent: thiz,
      id: "vmTfName",
      propertyOwner: thiz.document,
      propertyPath: "name",
      placeholder: "ambersteel.general.name",
    });
    this.vmBtnRoll = factory.createVmBtnRoll({
      parent: thiz,
      id: "vmBtnRoll",
      target: thiz.document,
      propertyPath: undefined,
      primaryChatTitle: game.i18n.localize(thiz.document.name),
      primaryChatImage: thiz.document.img,
      rollType: "dice-pool",
      callback: "advanceByRollResult",
      actor: thiz.document.owningDocument.document,
    })
    this.vmBtnSendToChat = factory.createVmBtnSendToChat({
      parent: thiz,
      id: "vmBtnSendToChat",
      target: thiz.document,
      isEditable: thiz.isEditable || thiz.isGM,
    });
    this.vmBtnDelete = factory.createVmBtnDelete({
      parent: thiz,
      id: "vmBtnDelete",
      target: thiz.document,
      withDialog: true,
    });
    this.vmBtnEdit = new ButtonViewModel({
      id: "vmBtnEdit",
      parent: this,
      isSendable: this.isSendable,
      isEditable: this.isEditable,
      isOwner: this.isOwner,
      target: this.document,
      localizableTitle: "ambersteel.general.edit",
      onClick: async () => {
        const delta = await querySkillConfiguration(this.document);
        if (delta !== undefined) {
          this.document.headState = delta.headState;
        }
      },
    });
    this.vmDdRelatedAttribute = factory.createVmDropDown({
      parent: thiz,
      id: "vmDdRelatedAttribute",
      propertyOwner: thiz.document,
      propertyPath: "relatedAttribute",
      options: thiz.attributeOptions,
      adapter: new ChoiceAdapter({
        toChoiceOption(obj) {
          if (isDefined(obj) === true) {
            return ATTRIBUTES.asChoices().find(it => it.value === obj.name);
          } else {
            return ATTRIBUTES.asChoices().find(it => it.value === "none");
          }
        },
        fromChoiceOption(option) {
          return ATTRIBUTES[option.value];
        }
      }),
    });
    this.vmTfCategory = factory.createVmTextField({
      parent: thiz,
      id: "vmTfCategory",
      propertyOwner: thiz.document,
      propertyPath: "category",
    });
    this.vmNsLevel = factory.createVmNumberSpinner({
      parent: thiz,
      id: "vmNsLevel",
      propertyOwner: thiz.document,
      propertyPath: "level",
      min: 0,
    });
    this.vmNsLevelModifier = factory.createVmNumberSpinner({
      parent: thiz,
      id: "vmNsLevelModifier",
      propertyOwner: thiz.document,
      propertyPath: "levelModifier",
    });
    this.vmNsSuccesses = factory.createVmNumberSpinner({
      parent: thiz,
      id: "vmNsSuccesses",
      propertyOwner: thiz.document,
      propertyPath: "advancementProgress.successes",
      min: 0,
    });
    this.vmNsFailures = factory.createVmNumberSpinner({
      parent: thiz,
      id: "vmNsFailures",
      propertyOwner: thiz.document,
      propertyPath: "advancementProgress.failures",
      min: 0,
    });
    if (this.showSkillAbilities === true) {
      this.vmSkillAbilityTable = new SkillAbilityTableViewModel({
        id: "vmSkillAbilityTable",
        parent: thiz,
        isEditable: thiz.isEditable,
        isSendable: thiz.isSendable,
        isOwner: thiz.isOwner,
        document: thiz.document,
        skillAbilitiesInitiallyVisible: false,
        visGroupId: thiz.visGroupId,
      });
    }
    this.vmRtDescription = factory.createVmRichText({
      parent: thiz,
      id: "vmRtDescription",
      propertyOwner: thiz.document,
      propertyPath: "description",
    });
    this.vmTags = new InputTagsViewModel({
      id: "vmTags",
      parent: this,
      propertyPath: "tags",
      propertyOwner: this.document,
      isEditable: this.isEditable,
      systemTags: SKILL_TAGS.asArray(),
    });
  }

  /** @override */
  _getChildUpdates() {
    const updates = super._getChildUpdates();

    updates.set(this.vmBtnSendToChat, {
      ...updates.get(this.vmBtnSendToChat),
      isEditable: this.isEditable || this.isGM,
    });

    return updates;
  }
}
