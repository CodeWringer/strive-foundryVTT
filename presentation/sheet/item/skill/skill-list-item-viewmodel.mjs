import { SKILL_HEAD_STATES } from "../../../../business/document/item/transient-skill.mjs"
import { ATTRIBUTES } from "../../../../business/ruleset/attribute/attributes.mjs"
import { SKILL_TAGS } from "../../../../business/tags/system-tags.mjs"
import { setNestedPropertyValue } from "../../../../business/util/property-utility.mjs"
import { validateOrThrow } from "../../../../business/util/validation-utility.mjs"
import { isDefined } from "../../../../business/util/validation-utility.mjs"
import ButtonCheckBoxViewModel from "../../../component/button-checkbox/button-checkbox-viewmodel.mjs"
import ButtonViewModel from "../../../component/button/button-viewmodel.mjs"
import ChoiceAdapter from "../../../component/input-choice/choice-adapter.mjs"
import InputDropDownViewModel from "../../../component/input-dropdown/input-dropdown-viewmodel.mjs"
import InputImageViewModel from "../../../component/input-image/input-image-viewmodel.mjs"
import InputNumberSpinnerViewModel from "../../../component/input-number-spinner/input-number-spinner-viewmodel.mjs"
import InputRichTextViewModel from "../../../component/input-rich-text/input-rich-text-viewmodel.mjs"
import InputTagsViewModel from "../../../component/input-tags/input-tags-viewmodel.mjs"
import InputTextFieldViewModel from "../../../component/input-textfield/input-textfield-viewmodel.mjs"
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

    this.vmImg = new InputImageViewModel({
      parent: thiz,
      id: "vmImg",
      value: thiz.document.img,
      onChange: (_, newValue) => {
        thiz.document.img = newValue;
      },
    });
    this.vmTfName = new InputTextFieldViewModel({
      parent: thiz,
      id: "vmTfName",
      value: thiz.document.name,
      onChange: (_, newValue) => {
        thiz.document.name = newValue;
      },
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
      localizedTooltip: game.i18n.localize("ambersteel.general.edit"),
      onClick: async () => {
        const delta = await querySkillConfiguration(this.document);
        if (delta !== undefined) {
          this.document.headState = delta.headState;
        }
      },
    });
    this.vmDdRelatedAttribute = new InputDropDownViewModel({
      id: "vmDdRelatedAttribute",
      parent: thiz,
      options: thiz.attributeOptions,
      onChange: (_, newValue) => {
        setNestedPropertyValue(this.document, "relatedAttribute", newValue);
      },
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
    this.vmTfCategory = new InputTextFieldViewModel({
      parent: thiz,
      id: "vmTfCategory",
      value: thiz.document.category,
      onChange: (_, newValue) => {
        thiz.document.category = newValue;
      },
    });
    this.vmNsLevel = new InputNumberSpinnerViewModel({
      parent: thiz,
      id: "vmNsLevel",
      value: thiz.document.level,
      onChange: (_, newValue) => {
        thiz.document.level = newValue;
      },
      min: 0,
    });
    this.vmNsLevelModifier = new InputNumberSpinnerViewModel({
      parent: thiz,
      id: "vmNsLevelModifier",
      value: thiz.document.levelModifier,
      onChange: (_, newValue) => {
        thiz.document.levelModifier = newValue;
      },
    });
    this.vmNsSuccesses = new InputNumberSpinnerViewModel({
      parent: thiz,
      id: "vmNsSuccesses",
      value: thiz.document.advancementProgress.successes,
      onChange: (_, newValue) => {
        thiz.document.advancementProgress.successes = newValue;
      },
      min: 0,
    });
    this.vmNsFailures = new InputNumberSpinnerViewModel({
      parent: thiz,
      id: "vmNsFailures",
      value: thiz.document.advancementProgress.failures,
      onChange: (_, newValue) => {
        thiz.document.advancementProgress.failures = newValue;
      },
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
    this.vmRtDescription = new InputRichTextViewModel({
      parent: thiz,
      id: "vmRtDescription",
      value: thiz.document.description,
      onChange: (_, newValue) => {
        thiz.document.description = newValue;
      },
    });
    this.vmTags = new InputTagsViewModel({
      id: "vmTags",
      parent: this,
      systemTags: SKILL_TAGS.asArray(),
      value: this.document.tags,
      onChange: (_, newValue) => {
        this.document.tags = newValue;
      },
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
