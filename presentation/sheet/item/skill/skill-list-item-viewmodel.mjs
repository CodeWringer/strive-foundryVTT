import TransientSkill from "../../../../business/document/item/skill/transient-skill.mjs"
import { ATTRIBUTES } from "../../../../business/ruleset/attribute/attributes.mjs"
import { DAMAGE_TYPES } from "../../../../business/ruleset/damage-types.mjs"
import { ATTACK_TYPES, getAttackTypeIconClass } from "../../../../business/ruleset/skill/attack-types.mjs"
import DamageAndType from "../../../../business/ruleset/skill/damage-and-type.mjs"
import { SKILL_TAGS } from "../../../../business/tags/system-tags.mjs"
import { validateOrThrow } from "../../../../business/util/validation-utility.mjs"
import { isDefined } from "../../../../business/util/validation-utility.mjs"
import ButtonContextMenuViewModel from "../../../component/button-context-menu/button-context-menu-viewmodel.mjs"
import ButtonDeleteViewModel from "../../../component/button-delete/button-delete-viewmodel.mjs"
import ButtonRollViewModel from "../../../component/button-roll/button-roll-viewmodel.mjs"
import DamageDefinitionListViewModel from "../../../component/damage-definition-list/damage-definition-list-viewmodel.mjs"
import InfoBubble, { InfoBubbleAutoHidingTypes, InfoBubbleAutoShowingTypes } from "../../../component/info-bubble/info-bubble.mjs"
import ChoiceAdapter from "../../../component/input-choice/choice-adapter.mjs"
import InputDropDownViewModel from "../../../component/input-dropdown/input-dropdown-viewmodel.mjs"
import InputNumberSpinnerViewModel from "../../../component/input-number-spinner/input-number-spinner-viewmodel.mjs"
import InputTagsViewModel from "../../../component/input-tags/input-tags-viewmodel.mjs"
import InputTextFieldViewModel from "../../../component/input-textfield/input-textfield-viewmodel.mjs"
import { TEMPLATES } from "../../../templatePreloader.mjs"
import BaseListItemViewModel from "../base/base-list-item-viewmodel.mjs"
import { DataFieldComponent } from "../base/datafield-component.mjs"
import { TemplatedComponent } from "../base/templated-component.mjs"
import SkillAbilityTableViewModel from "../skill-ability/skill-ability-table-viewmodel.mjs"

export default class SkillListItemViewModel extends BaseListItemViewModel {
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
   * Returns the CSS class of the icon that represents the current attack type. 
   * 
   * @type {String}
   * @readonly
   */
  get attackTypeIconClass() {
    if (isDefined(this.document.attackType)) {
      return getAttackTypeIconClass(this.document.attackType);
    } else {
      return "";
    }
  }

  /**
   * @type {Boolean}
   * @readonly
   */
  get hideObstacle() { return !isDefined(this.document.obstacle); }

  /**
   * @type {Boolean}
   * @readonly
   */
  get hideOpposedBy() { return !isDefined(this.document.opposedBy); }

  /**
   * @type {Boolean}
   * @readonly
   */
  get hideDistance() { return !isDefined(this.document.distance); }

  /**
   * @type {Boolean}
   * @readonly
   */
  get hideApCost() { return !isDefined(this.document.apCost); }

  /**
   * @type {Boolean}
   * @readonly
   */
  get hideAttackType() { return !isDefined(this.document.attackType); }

  /**
   * @type {Boolean}
   * @readonly
   */
  get hideCondition() { return !isDefined(this.document.condition); }

  /**
   * @type {Boolean}
   * @readonly
   */
  get hideDamage() { return this.document.damage.length === 0; }

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

    this.vmDdRelatedAttribute = new InputDropDownViewModel({
      id: "vmDdRelatedAttribute",
      parent: this,
      options: this.attributeOptions,
      value: this.attributeOptions.find(it => it.value === this.document.relatedAttribute.name),
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
      parent: this,
      id: "vmTfCategory",
      value: this.document.category,
      onChange: (_, newValue) => {
        this.document.category = newValue;
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
    this.vmNsLevel = new InputNumberSpinnerViewModel({
      parent: this,
      id: "vmNsLevel",
      value: this.document.dependsOnActiveCr === true ? this.document.crLevel : this.document.level,
      isEditable: this.document.dependsOnActiveCr === true ? false : this.isEditable,
      onChange: (_, newValue) => {
        this.document.level = newValue;
      },
      min: 0,
    });
    this.vmNsLevelModifier = new InputNumberSpinnerViewModel({
      parent: this,
      id: "vmNsLevelModifier",
      value: this.document.levelModifier,
      onChange: (_, newValue) => {
        this.document.levelModifier = newValue;
      },
    });
    if (this.showAdvancementProgression) {
      this.vmNsSuccesses = new InputNumberSpinnerViewModel({
        parent: this,
        id: "vmNsSuccesses",
        value: this.document.advancementProgress.successes,
        onChange: (_, newValue) => {
          this.document.advancementProgress.successes = newValue;
        },
        min: 0,
      });
      this.vmNsFailures = new InputNumberSpinnerViewModel({
        parent: this,
        id: "vmNsFailures",
        value: this.document.advancementProgress.failures,
        onChange: (_, newValue) => {
          this.document.advancementProgress.failures = newValue;
        },
        min: 0,
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
      chatTitle: `${game.i18n.localize("ambersteel.damageDefinition.formula")} - ${this.document.name}`,
    });
    if (this.showSkillAbilities === true) {
      this.vmSkillAbilityTable = new SkillAbilityTableViewModel({
        id: "vmSkillAbilityTable",
        parent: this,
        isEditable: this.isEditable,
        isSendable: this.isSendable,
        isOwner: this.isOwner,
        document: this.document,
        skillAbilitiesInitiallyVisible: true,
      });
    }
    this.skillAbilitiesTemplate = SkillAbilityTableViewModel.TEMPLATE;
  }

  /** @override */
  getDataFields() {
    return [
      new DataFieldComponent({
        template: InputNumberSpinnerViewModel.TEMPLATE,
        viewModel: new InputNumberSpinnerViewModel({
          parent: this,
          id: "vmApCost",
          value: this.document.apCost,
          onChange: (_, newValue) => {
            this.document.apCost = newValue;
          },
          min: 0,
        }),
        isHidden: this.hideApCost,
        localizedIconToolTip: game.i18n.localize("ambersteel.actionPoint.plural"),
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
        placeholder: game.i18n.localize("ambersteel.character.skill.ability.condition.placeholder"),
        localizedIconToolTip: game.i18n.localize("ambersteel.character.skill.ability.condition.label"),
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
        placeholder: game.i18n.localize("ambersteel.roll.obstacle.placeholder"),
        localizedIconToolTip: game.i18n.localize("ambersteel.roll.obstacle.label"),
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
        placeholder: game.i18n.localize("ambersteel.roll.obstacle.opposedBy.placeholder"),
        localizedIconToolTip: game.i18n.localize("ambersteel.roll.obstacle.opposedBy.label"),
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
        placeholder: game.i18n.localize("ambersteel.character.skill.ability.distance.placeholder"),
        localizedIconToolTip: game.i18n.localize("ambersteel.character.skill.ability.distance.label"),
        iconClass: "ico-distance-solid",
      }),
      new DataFieldComponent({
        template: InputDropDownViewModel.TEMPLATE,
        viewModel: new InputDropDownViewModel({
          id: "vmAttackType",
          parent: this,
          options: ATTACK_TYPES.asChoices(),
          value: isDefined(this.document.attackType) ? ATTACK_TYPES.asChoices().find(it => it.value === this.document.attackType.name) : undefined,
          onChange: (_, newValue) => {
            this.document.attackType = ATTACK_TYPES[newValue];
          },
          adapter: new ChoiceAdapter({
            toChoiceOption(obj) {
              if (isDefined(obj) === true) {
                return ATTACK_TYPES.asChoices().find(it => it.value === obj.name);
              } else {
                return ATTACK_TYPES.asChoices().find(it => it.value === "none");
              }
            },
            fromChoiceOption(option) {
              return ATTACK_TYPES[option.value];
            }
          }),
        }),
        isHidden: this.hideAttackType,
        localizedIconToolTip: game.i18n.localize("ambersteel.attackType.label"),
        iconClass: this.attackTypeIconClass,
      }),
    ];
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);

    this.damageInfoBubble = new InfoBubble({
      html: html,
      map: [
        { element: html.find(`#${this.id}-damage-info`), text: game.i18n.localize("ambersteel.damageDefinition.infoFormulae") },
      ],
      autoShowType: InfoBubbleAutoShowingTypes.MOUSE_ENTER,
      autoHideType: InfoBubbleAutoHidingTypes.MOUSE_LEAVE,
    });
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
          propertyPath: undefined,
          primaryChatTitle: game.i18n.localize(this.document.name),
          primaryChatImage: this.document.img,
          rollType: "dice-pool",
          onClick: async (event, data) => {
            await this.document.advanceByRollResult(data);
          },
          actor: this.document.owningDocument.document,
        }),
      }),
    ].concat(inherited);
  }

  /** @override */
  getSecondaryHeaderButtons() {
    return [
      // Context menu button
      new TemplatedComponent({
        template: ButtonContextMenuViewModel.TEMPLATE,
        viewModel: new ButtonContextMenuViewModel({
          id: "vmBtnContextMenu",
          parent: this,
          menuItems: [
            // Edit name
            {
              name: game.i18n.localize("ambersteel.general.name.edit"),
              icon: '<i class="fas fa-edit"></i>',
              callback: this.queryEditName.bind(this),
            },
            // Add damage
            {
              name: game.i18n.localize("ambersteel.damageDefinition.add"),
              icon: '<i class="fas fa-plus"></i>',
              callback: () => {
                const damage = this.document.damage.concat([]);
                damage.push(new DamageAndType({
                  damage: "",
                  damageType: DAMAGE_TYPES.none.name,
                }));
                this.document.damage = damage;
              },
            },
          ]
          // Toggle ap cost
          .concat(ButtonContextMenuViewModel.createToggleButtons("ambersteel.character.skill.ability.apCost", this.document, "apCost", 0))
          // Toggle obstacle
          .concat(ButtonContextMenuViewModel.createToggleButtons("ambersteel.roll.obstacle.label", this.document, "obstacle", ""))
          // Toggle opposed by
          .concat(ButtonContextMenuViewModel.createToggleButtons("ambersteel.roll.obstacle.opposedBy.label", this.document, "opposedBy", ""))
          // Toggle distance
          .concat(ButtonContextMenuViewModel.createToggleButtons("ambersteel.character.skill.ability.distance.label", this.document, "distance", ""))
          // Toggle attack type
          .concat(ButtonContextMenuViewModel.createToggleButtons("ambersteel.attackType.label", this.document, "attackType", ATTACK_TYPES.none))
          // Toggle condition
          .concat(ButtonContextMenuViewModel.createToggleButtons("ambersteel.character.skill.ability.condition.label", this.document, "condition", "")),
        }),
      }),
      // Delete button
      new TemplatedComponent({
        template: ButtonDeleteViewModel.TEMPLATE,
        viewModel: new ButtonDeleteViewModel({
          parent: this,
          id: "vmBtnDelete",
          target: this.document,
          withDialog: true,
        }),
      }),
    ]; 
  }

  /** @override */
  getAdditionalHeaderContent() {
    return new TemplatedComponent({
      template: TEMPLATES.SKILL_LIST_ITEM_EXTRA_HEADER,
      viewModel: this,
    });
  }

  /** @override */
  getAdditionalContent() {
    return new TemplatedComponent({
      template: TEMPLATES.SKILL_LIST_ITEM_EXTRA_CONTENT,
      viewModel: this,
    });
  }
}
