import TransientSkill from "../../../../business/document/item/skill/transient-skill.mjs"
import { ATTRIBUTES } from "../../../../business/ruleset/attribute/attributes.mjs"
import { SKILL_TAGS } from "../../../../business/tags/system-tags.mjs"
import { validateOrThrow } from "../../../../business/util/validation-utility.mjs"
import { isDefined } from "../../../../business/util/validation-utility.mjs"
import ButtonDeleteViewModel from "../../../component/button-delete/button-delete-viewmodel.mjs"
import ButtonRollViewModel from "../../../component/button-roll/button-roll-viewmodel.mjs"
import ButtonSendToChatViewModel from "../../../component/button-send-to-chat/button-send-to-chat-viewmodel.mjs"
import ButtonViewModel from "../../../component/button/button-viewmodel.mjs"
import ChoiceAdapter from "../../../component/input-choice/choice-adapter.mjs"
import InputDropDownViewModel from "../../../component/input-dropdown/input-dropdown-viewmodel.mjs"
import InputImageViewModel from "../../../component/input-image/input-image-viewmodel.mjs"
import InputNumberSpinnerViewModel from "../../../component/input-number-spinner/input-number-spinner-viewmodel.mjs"
import InputRichTextViewModel from "../../../component/input-rich-text/input-rich-text-viewmodel.mjs"
import InputTagsViewModel from "../../../component/input-tags/input-tags-viewmodel.mjs"
import InputTextFieldViewModel from "../../../component/input-textfield/input-textfield-viewmodel.mjs"
import { TEMPLATES } from "../../../templatePreloader.mjs"
import { CONTEXT_TYPES } from "../../context-types.mjs"
import SkillAbilityTableViewModel from "../skill-ability/skill-ability-table-viewmodel.mjs"
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
   * Returns true, if the list of prerequisites should be rendered. 
   * @type {Boolean}
   * @readonly
   */
  get showPrerequisites() { return this.document.prerequisites !== undefined && this.document.prerequisites.length > 0; }

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
   * @type {Boolean}
   * @readonly
   */
  get showAdvancementProgression() {
    if (isDefined(this.document.owningDocument) === true) {
      const type = this.document.owningDocument.type;
      if (type === "npc" && this.document.owningDocument.progressionVisible === true) {
        return true;
      } else if (type === "pc") {
        return true;
      }
    }
    return false;
  }

  /**
   * @type {Boolean}
   * @private
   */
  _isExpanded = false;
  /**
   * @type {Boolean}
   */
  get isExpanded() { return this._isExpanded; }
  set isExpanded(value) {
    this._isExpanded = value;
    this.writeViewState();

    const contentElement = this.element.find(`#${this.id}-content`);
    if (value === true) {
      contentElement.removeClass("hidden");
      contentElement.animate({
        height: "100%"
      }, 300, () => {
      });
    } else {
      contentElement.animate({
        height: "0%"
      }, 300, () => {
        contentElement.addClass("hidden");
      });
    }
  }

  /**
   * @type {String}
   * @readonly
   */
  get context() { return CONTEXT_TYPES.LIST_ITEM; }

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

    this.registerViewStateProperty("_isExpanded");
    this.readViewState();

    // Child view models. 
    const thiz = this;

    this.vmImg = new InputImageViewModel({
      parent: thiz,
      id: "vmImg",
      value: thiz.document.img,
      onChange: (_, newValue) => {
        thiz.document.img = newValue;
      },
    });
    this.vmHeaderButton = new ButtonViewModel({
      id: "vmHeaderButton",
      parent: this,
      localizedLabel: this.document.name,
      onClick: () => {
        this.isExpanded = !this.isExpanded;
      },
    });
    this.vmBtnRoll = new ButtonRollViewModel({
      parent: thiz,
      id: "vmBtnRoll",
      target: thiz.document,
      propertyPath: undefined,
      primaryChatTitle: game.i18n.localize(thiz.document.name),
      primaryChatImage: thiz.document.img,
      rollType: "dice-pool",
      onClick: async (event, data) => {
        await thiz.document.advanceByRollResult(data);
      },
      actor: thiz.document.owningDocument.document,
    })
    this.vmBtnSendToChat = new ButtonSendToChatViewModel({
      parent: thiz,
      id: "vmBtnSendToChat",
      target: thiz.document,
      isEditable: thiz.isEditable || thiz.isGM,
    });
    this.vmBtnDelete = new ButtonDeleteViewModel({
      parent: thiz,
      id: "vmBtnDelete",
      target: thiz.document,
      withDialog: true,
    });
    this.vmDdRelatedAttribute = new InputDropDownViewModel({
      id: "vmDdRelatedAttribute",
      parent: thiz,
      options: thiz.attributeOptions,
      value: thiz.attributeOptions.find(it => it.value === this.document.relatedAttribute.name),
      onChange: (_, newValue) => {
        this.document.relatedAttribute = newValue;
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
      value: this.document.dependsOnActiveCr === true ? this.document.crLevel : this.document.level,
      isEditable: this.document.dependsOnActiveCr === true ? false : this.isEditable,
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
    if (this.showAdvancementProgression) {
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
    }
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
    this.skillAbilitiesTemplate = SkillAbilityTableViewModel.TEMPLATE;
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
  activateListeners(html) {
    super.activateListeners(html);

    new ContextMenu(html, `#${this.vmHeaderButton.id}`, [
      {
        name: game.i18n.localize("ambersteel.general.name.edit"),
        icon: '<i class="fas fa-edit"></i>',
        callback: this.queryEditName.bind(this),
      },
    ]);
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
