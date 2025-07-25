import TransientSkill from "../../../../business/document/item/skill/transient-skill.mjs"
import { ATTRIBUTES } from "../../../../business/ruleset/attribute/attributes.mjs"
import { DAMAGE_TYPES } from "../../../../business/ruleset/damage-types.mjs"
import { ATTACK_TYPES, getAttackTypeIconClass } from "../../../../business/ruleset/skill/attack-types.mjs"
import DamageAndType from "../../../../business/ruleset/skill/damage-and-type.mjs"
import ButtonContextMenuViewModel, { ContextMenuItem } from "../../../component/button-context-menu/button-context-menu-viewmodel.mjs"
import ButtonRollViewModel from "../../../component/button-roll/button-roll-viewmodel.mjs"
import DamageDefinitionListViewModel from "../../../component/damage-definition-list/damage-definition-list-viewmodel.mjs"
import InputDropDownViewModel from "../../../component/input-choice/input-dropdown/input-dropdown-viewmodel.mjs"
import InputNumberSpinnerViewModel from "../../../component/input-number-spinner/input-number-spinner-viewmodel.mjs"
import InputTextFieldViewModel from "../../../component/input-textfield/input-textfield-viewmodel.mjs"
import BaseListItemViewModel from "../base/base-list-item-viewmodel.mjs"
import { DataFieldComponent } from "../base/datafield-component.mjs"
import { TemplatedComponent } from "../base/templated-component.mjs"
import ExpertiseTableViewModel from "../expertise/expertise-table-viewmodel.mjs"
import BaseAttributeListItemViewModel from "./base-attribute/base-attribute-list-item-viewmodel.mjs"
import { ACTOR_TYPES } from "../../../../business/document/actor/actor-types.mjs"
import Ruleset from "../../../../business/ruleset/ruleset.mjs"
import ButtonCheckBoxViewModel from "../../../component/button-checkbox/button-checkbox-viewmodel.mjs"
import { StringUtil } from "../../../../business/util/string-utility.mjs"
import { ExtenderUtil } from "../../../../common/extender-util.mjs"
import { ValidationUtil } from "../../../../business/util/validation-utility.mjs"
import RulesetExplainer from "../../../../business/ruleset/ruleset-explainer.mjs"
import ReadOnlyValueViewModel from "../../../component/read-only-value/read-only-value.mjs"
import ViewModel from "../../../view-model/view-model.mjs"
import { SKILL_TAGS } from "../../../../business/tags/system-tags.mjs"
import DynamicInputDefinition from "../../../dialog/dynamic-input-dialog/dynamic-input-definition.mjs"
import SimpleListViewModel from "../../../component/simple-list/simple-list-viewmodel.mjs"

/**
 * @property {TransientSkill} document
 */
export default class SkillListItemViewModel extends BaseListItemViewModel {
  /** @override */
  static get HEADER_TEMPLATE() { return game.strive.const.TEMPLATES.SKILL_LIST_ITEM_HEADER; }

  /**
   * Returns true, if the expertise list should be visible. 
   * @type {Boolean}
   * @readonly
   */
  get isExpertiseListVisible() { return (this.isEditable === true) || this.document.expertises.length !== 0 }

  /**
   * Returns the current advancement requirements. 
   * @type {Object}
   * @readonly
   */
  get advancementRequirements() { return this.document.advancementRequirements; }

  /**
   * Returns true, if the expertise list should be rendered. 
   * @type {Boolean}
   * @readonly
   */
  get showExpertises() { return this.isEditable === true || this.document.expertises.length > 0; }

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
    const thiz = this;
    return this.document.prerequisites.map(prerequisite => {
      return {
        id: prerequisite.id,
        name: prerequisite.name,
        minimumLevel: prerequisite.minimumLevel,
        vmName: new ReadOnlyValueViewModel({
          id: "vmName",
          parent: thiz,
          value: prerequisite.name,
        }),
        vmMinimumLevel: new ReadOnlyValueViewModel({
          id: "vmMinimumLevel",
          parent: thiz,
          value: prerequisite.minimumLevel,
        }),
      };
    });
  }

  /**
   * @type {Boolean}
   * @readonly
   */
  get showAdvancementProgression() {
    if (ValidationUtil.isDefined(this.document.owningDocument) === true) {
      const type = this.document.owningDocument.type;
      if (type === ACTOR_TYPES.NPC && this.document.owningDocument.progressionVisible === true) {
        return true;
      } else if (type === ACTOR_TYPES.PC) {
        return true;
      }
    }
    return false;
  }

  /**
   * Returns the CSS class of the icon that represents the current attack type. 
   * 
   * @type {String}
   * @readonly
   */
  get attackTypeIconClass() {
    if (ValidationUtil.isDefined(this.document.attackType)) {
      return getAttackTypeIconClass(this.document.attackType);
    } else {
      return "";
    }
  }

  /**
   * @type {Boolean}
   * @readonly
   */
  get hideObstacle() { return !ValidationUtil.isDefined(this.document.obstacle); }

  /**
   * @type {Boolean}
   * @readonly
   */
  get hideOpposedBy() { return !ValidationUtil.isDefined(this.document.opposedBy); }

  /**
   * @type {Boolean}
   * @readonly
   */
  get hideDistance() { return !ValidationUtil.isDefined(this.document.distance); }

  /**
   * @type {Boolean}
   * @readonly
   */
  get hideApCost() { return !ValidationUtil.isDefined(this.document.apCost); }

  /**
   * @type {Boolean}
   * @readonly
   */
  get hideAttackType() { return !ValidationUtil.isDefined(this.document.attackType); }

  /**
   * @type {Boolean}
   * @readonly
   */
  get hideCondition() { return !ValidationUtil.isDefined(this.document.condition); }

  /**
   * @type {Boolean}
   * @readonly
   */
  get hideDamage() { return this.document.damage.length === 0; }

  /**
   * @private
   * @readonly
   * 
   * @returns {String}
   */
  get _inputAttributes() { return "inputAttributes"; }

  /**
   * @returns {Number}
   * @readonly
   */
  get apCost() { return this.document.apCost; }

  /**
   * @returns {Boolean}
   * @readonly
   */
  get isLearningSkill() { return this.document.level === 0; }

  /**
   * @returns {Boolean}
   * @readonly
   */
  get isInnateSkill() { return ValidationUtil.isDefined(this.document.tags.find(it => it.id === SKILL_TAGS.INNATE.id)); }

  /** @override */
  get metaDataInputDefinitions() {
    const baseAttributes = this.document.baseAttributes.concat([]); // Safe copy
    const metaData = super.metaDataInputDefinitions;
    metaData.splice(0, 0, 
      new DynamicInputDefinition({
        name: this._inputAttributes,
        localizedLabel: game.i18n.localize("system.character.attribute.plural"),
        template: SimpleListViewModel.TEMPLATE,
        viewModelFactory: (id, parent, overrides) => new SimpleListViewModel({
          id: id,
          parent: parent,
          value: baseAttributes,
          contentItemTemplate: BaseAttributeListItemViewModel.TEMPLATE,
          contentItemViewModelFactory: (index, attribute) => {
            return new BaseAttributeListItemViewModel({
              id: `vmAttribute${index}`,
              isEditable: true,
              attribute: attribute,
            });
          },
          newItemDefaultValue: ATTRIBUTES.agility,
          isItemAddable: this.isEditable,
          isItemRemovable: this.isEditable,
          localizedAddLabel: game.i18n.localize("system.general.add.add"),
          ...overrides,
        }),
        required: true,
        validationFunc: (value) => { return value.length > 0; },
      }),
    );
    return metaData;
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
    super({
      ...args,
      title: args.document.nameForDisplay,
    });
    ValidationUtil.validateOrThrow(args, ["document"]);

    const level = this.document.level;
    // Header
    this.vmModifiedLevelHeader = new ReadOnlyValueViewModel({
      id: "vmModifiedLevelHeader",
      parent: this,
      value: this.modifiedLevel,
      localizedToolTip: game.i18n.localize("system.character.advancement.modifiedLevel"),
    });
    // Promoted content
    this.vmRawLevel = new InputNumberSpinnerViewModel({
      id: "vmRawLevel",
      parent: this,
      value: level,
      min: 0,
      localizedToolTip: game.i18n.localize("system.character.advancement.level"),
      onChange: (_, newValue) => {
        this.document.level = newValue;
      },
    });
    this.vmLevel = new InputNumberSpinnerViewModel({
      id: "vmLevel",
      parent: this,
      value: this.document.level + this.document.levelModifier,
      localizedToolTip: StringUtil.format2(game.i18n.localize("system.character.advancement.modifiedLevelWithPlaceholders"), {
        rawLevel: this.document.level,
        operand: this.document.levelModifier >= 0 ? "+" : "-",
        modifier: Math.abs(this.document.levelModifier),
        modifiedLevel: this.document.modifiedLevel,
      }),
      onChange: (_, newValue) => {
        this.document.levelModifier = newValue - this.document.level;
      },
      displayValueMapper: (value) => {
        return this.document.modifiedLevel;
      },
    });
    this.maxHpModifierString = `(${this.document.levelModifier >= 0 ? "+" : "-"}${Math.abs(this.document.levelModifier)})`;

    if (this.showAdvancementProgression) {
      this.vmNsSuccesses = new InputNumberSpinnerViewModel({
        parent: this,
        id: "vmNsSuccesses",
        localizedToolTip: game.i18n.localize("system.character.advancement.requirements.success.label"),
        value: this.document.advancementProgress.successes,
        onChange: (_, newValue) => {
          this.document.advancementProgress.successes = newValue;
        },
        min: 0,
      });
      this.vmAdvancementRequirementSuccesses = new ReadOnlyValueViewModel({
        id: "vmAdvancementRequirements",
        parent: this,
        value: this.advancementRequirements.successes,
        localizedToolTip: new RulesetExplainer().getExplanationForSkillAdvancementRequirements(this.document),
      });
      this.vmNsFailures = new InputNumberSpinnerViewModel({
        parent: this,
        id: "vmNsFailures",
        value: this.document.advancementProgress.failures,
        localizedToolTip: game.i18n.localize("system.character.advancement.requirements.failure.label"),
        onChange: (_, newValue) => {
          this.document.advancementProgress.failures = newValue;
        },
        min: 0,
      });
      this.vmAdvancementRequirementFailures = new ReadOnlyValueViewModel({
        id: "vmAdvancementRequirementFailures",
        parent: this,
        value: this.advancementRequirements.failures,
        localizedToolTip: new RulesetExplainer().getExplanationForSkillAdvancementRequirements(this.document),
      });
      this.vmAdvanced = new ButtonCheckBoxViewModel({
        parent: this,
        id: "vmAdvanced",
        value: this.document.advanced,
        localizedToolTip: game.i18n.localize("system.character.advancement.advanced"),
        onChange: (_, newValue) => {
          this.document.advanced = newValue;
        },
      });
    }
    this.vmDamageDefinitionList = new DamageDefinitionListViewModel({
      id: `vmDamageDefinitionList`,
      parent: this,
      value: this.document.damage,
      onChange: (_, newValue) => {
        this.document.damage = newValue;
      },
      resolveFormulaContext: this.getRootOwningDocument(this.document),
      chatTitle: `${game.i18n.localize("system.damageDefinition.label")} - ${this.document.name}`,
    });
    this.vmDamageFormulaInfo = new ViewModel({
      id: "damage-info",
      parent: this,
      localizedToolTip: game.i18n.localize("system.damageDefinition.infoFormulae"),
    });
    if (this.showExpertises === true) {
      this.vmExpertiseTable = new ExpertiseTableViewModel({
        id: "vmExpertiseTable",
        parent: this,
        document: this.document,
        expertisesInitiallyVisible: this.document.expertises.length > 0,
      });
    }
    this.expertisesTemplate = ExpertiseTableViewModel.TEMPLATE;
  }

  /** @override */
  getDataFields() {
    const attackTypeChoices = ATTACK_TYPES.asChoices();

    return [
      new DataFieldComponent({
        template: InputNumberSpinnerViewModel.TEMPLATE,
        viewModel: new InputNumberSpinnerViewModel({
          parent: this,
          id: "vmApCost",
          value: this.document.apCost,
          min: 0,
          onChange: (_, newValue) => {
            this.document.apCost = newValue;
          },
        }),
        isHidden: this.hideApCost,
        localizedIconToolTip: game.i18n.localize("system.actionPoint.plural"),
        iconClass: "ico-action-point-solid",
      }),
      new DataFieldComponent({
        template: InputTextFieldViewModel.TEMPLATE,
        viewModel: new InputTextFieldViewModel({
          parent: this,
          id: "vmCondition",
          value: this.document.condition,
          onChange: (_, newValue) => {
            this.document.condition = newValue;
          },
        }),
        isHidden: this.hideCondition,
        placeholder: game.i18n.localize("system.character.skill.expertise.condition.placeholder"),
        localizedIconToolTip: game.i18n.localize("system.character.skill.expertise.condition.label"),
        iconClass: "ico-condition-solid",
      }),
      new DataFieldComponent({
        template: InputTextFieldViewModel.TEMPLATE,
        viewModel: new InputTextFieldViewModel({
          parent: this,
          id: "vmObstacle",
          value: this.document.obstacle,
          onChange: (_, newValue) => {
            this.document.obstacle = newValue;
          },
        }),
        isHidden: this.hideObstacle,
        placeholder: game.i18n.localize("system.roll.obstacle.placeholder"),
        localizedIconToolTip: game.i18n.localize("system.roll.obstacle.label"),
        iconClass: "ico-obstacle-solid",
      }),
      new DataFieldComponent({
        template: InputTextFieldViewModel.TEMPLATE,
        viewModel: new InputTextFieldViewModel({
          parent: this,
          id: "vmOpposedBy",
          value: this.document.opposedBy,
          onChange: (_, newValue) => {
            this.document.opposedBy = newValue;
          },
        }),
        isHidden: this.hideOpposedBy,
        placeholder: game.i18n.localize("system.roll.obstacle.opposedBy.placeholder"),
        localizedIconToolTip: game.i18n.localize("system.roll.obstacle.opposedBy.label"),
        iconClass: "ico-opposed-by-solid",
      }),
      new DataFieldComponent({
        template: InputTextFieldViewModel.TEMPLATE,
        viewModel: new InputTextFieldViewModel({
          parent: this,
          id: "vmDistance",
          value: this.document.distance,
          onChange: (_, newValue) => {
            this.document.distance = newValue;
          },
        }),
        isHidden: this.hideDistance,
        placeholder: game.i18n.localize("system.character.skill.expertise.distance.placeholder"),
        localizedIconToolTip: game.i18n.localize("system.character.skill.expertise.distance.label"),
        iconClass: "ico-distance-solid",
      }),
      new DataFieldComponent({
        template: InputDropDownViewModel.TEMPLATE,
        viewModel: new InputDropDownViewModel({
          id: "vmAttackType",
          parent: this,
          options: attackTypeChoices,
          value: ValidationUtil.isDefined(this.document.attackType) ? attackTypeChoices.find(it => it.value === this.document.attackType.name) : attackTypeChoices.find(it => it.value === ATTACK_TYPES.none.name),
          onChange: (_, newValue) => {
            this.document.attackType = ATTACK_TYPES[newValue.value];
          },
        }),
        isHidden: this.hideAttackType,
        localizedIconToolTip: game.i18n.localize("system.attackType.label"),
        iconClass: this.attackTypeIconClass,
      }),
    ];
  }

  /** @override */
  getPrimaryHeaderButtons() {
    const inherited = super.getPrimaryHeaderButtons();
    return [
      new TemplatedComponent({
        template: ButtonRollViewModel.TEMPLATE,
        viewModel: new ButtonRollViewModel({
          parent: this,
          id: "vmBtnRoll",
          target: this.document,
          rollSchema: new Ruleset().getSkillRollSchema(),
          primaryChatTitle: game.i18n.localize(this.document.name),
          primaryChatImage: this.document.img,
          actor: this.document.owningDocument.document,
        }),
      }),
    ].concat(inherited);
  }

  /** @override */
  getContextMenuButtons() {
    return super.getContextMenuButtons().concat([
      // Add damage
      new ContextMenuItem({
        name: StringUtil.format(
          game.i18n.localize("system.general.add.addType"),
          game.i18n.localize("system.damageDefinition.label")
        ),
        icon: '<i class="fas fa-plus"></i>',
        condition: this.isEditable,
        callback: () => {
          const damage = this.document.damage.concat([]);
          damage.push(new DamageAndType({
            damage: "",
            damageType: DAMAGE_TYPES.none.name,
          }));
          this.document.damage = damage;
        },
      }),
    ])
      // Toggle ap cost
      .concat(
        ButtonContextMenuViewModel.createToggleButtons({
          label: "system.character.skill.expertise.apCost",
          propertyOwner: this.document,
          propertyName: "apCost",
          activeValue: 0,
          isEditable: this.isEditable,
        })
      )
      // Toggle obstacle
      .concat(
        ButtonContextMenuViewModel.createToggleButtons({
          label: "system.roll.obstacle.label",
          propertyOwner: this.document,
          propertyName: "obstacle",
          activeValue: "",
          isEditable: this.isEditable,
        })
      )
      // Toggle opposed by
      .concat(
        ButtonContextMenuViewModel.createToggleButtons({
          label: "system.roll.obstacle.opposedBy.label",
          propertyOwner: this.document,
          propertyName: "opposedBy",
          activeValue: "",
          isEditable: this.isEditable,
        })
      )
      // Toggle distance
      .concat(
        ButtonContextMenuViewModel.createToggleButtons({
          label: "system.character.skill.expertise.distance.label",
          propertyOwner: this.document,
          propertyName: "distance",
          activeValue: "",
          isEditable: this.isEditable,
        })
      )
      // Toggle attack type
      .concat(
        ButtonContextMenuViewModel.createToggleButtons({
          label: "system.attackType.label",
          propertyOwner: this.document,
          propertyName: "attackType",
          activeValue: ATTACK_TYPES.none,
          isEditable: this.isEditable,
        })
      )
      // Toggle condition
      .concat(
        ButtonContextMenuViewModel.createToggleButtons({
          label: "system.character.skill.expertise.condition.label",
          propertyOwner: this.document,
          propertyName: "condition",
          activeValue: "",
          isEditable: this.isEditable,
        })
      );
  }

  /** @override */
  getHeaderTemplate() {
    return new TemplatedComponent({
      template: SkillListItemViewModel.HEADER_TEMPLATE,
      viewModel: this,
    });
  }

  /** @override */
  getPromotedContentTemplate() {
    return new TemplatedComponent({
      template: game.strive.const.TEMPLATES.SKILL_LIST_ITEM_PROMOTED_CONTENT,
      viewModel: this,
    });
  }

  /** @override */
  getAdditionalContent() {
    return new TemplatedComponent({
      template: game.strive.const.TEMPLATES.SKILL_LIST_ITEM_EXTRA_CONTENT,
      viewModel: this,
    });
  }

  /** @override */
  async editMetaData() {
    const dialog = await super.editMetaData();
    
    if (ValidationUtil.isDefined(dialog) !== true) return;

    const deltaAttributes = dialog[this._inputAttributes];
    if (ValidationUtil.isDefined(deltaAttributes) === true)
      this.document.baseAttributes = deltaAttributes;
  }

  /** @override */
  getExtenders() {
    return super.getExtenders().concat(ExtenderUtil.getExtenders(SkillListItemViewModel));
  }

}
