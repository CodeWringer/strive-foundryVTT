import TransientSkill from "../../../../business/document/item/skill/transient-skill.mjs"
import { ATTRIBUTES, Attribute } from "../../../../business/ruleset/attribute/attributes.mjs"
import { DAMAGE_TYPES } from "../../../../business/ruleset/damage-types.mjs"
import { ATTACK_TYPES, getAttackTypeIconClass } from "../../../../business/ruleset/skill/attack-types.mjs"
import DamageAndType from "../../../../business/ruleset/skill/damage-and-type.mjs"
import { SKILL_TAGS } from "../../../../business/tags/system-tags.mjs"
import { validateOrThrow } from "../../../../business/util/validation-utility.mjs"
import { isDefined } from "../../../../business/util/validation-utility.mjs"
import ButtonContextMenuViewModel from "../../../component/button-context-menu/button-context-menu-viewmodel.mjs"
import ButtonDeleteViewModel from "../../../component/button-delete/button-delete-viewmodel.mjs"
import ButtonRollViewModel from "../../../component/button-roll/button-roll-viewmodel.mjs"
import ButtonViewModel from "../../../component/button/button-viewmodel.mjs"
import DamageDefinitionListViewModel from "../../../component/damage-definition-list/damage-definition-list-viewmodel.mjs"
import InfoBubble, { InfoBubbleAutoHidingTypes, InfoBubbleAutoShowingTypes } from "../../../component/info-bubble/info-bubble.mjs"
import ChoiceAdapter from "../../../component/input-choice/choice-adapter.mjs"
import ChoiceOption from "../../../component/input-choice/choice-option.mjs"
import InputDropDownViewModel from "../../../component/input-dropdown/input-dropdown-viewmodel.mjs"
import InputNumberSpinnerViewModel from "../../../component/input-number-spinner/input-number-spinner-viewmodel.mjs"
import InputTagsViewModel from "../../../component/input-tags/input-tags-viewmodel.mjs"
import InputTextFieldViewModel from "../../../component/input-textfield/input-textfield-viewmodel.mjs"
import DynamicInputDialog from "../../../dialog/dynamic-input-dialog/dynamic-input-dialog.mjs"
import { TEMPLATES } from "../../../templatePreloader.mjs"
import BaseListItemViewModel from "../base/base-list-item-viewmodel.mjs"
import { DataFieldComponent } from "../base/datafield-component.mjs"
import { TemplatedComponent } from "../base/templated-component.mjs"
import ExpertiseTableViewModel from "../expertise/expertise-table-viewmodel.mjs"
import * as StringUtil from "../../../../business/util/string-utility.mjs"
import DynamicInputDefinition from "../../../dialog/dynamic-input-dialog/dynamic-input-definition.mjs"
import { DYNAMIC_INPUT_TYPES } from "../../../dialog/dynamic-input-dialog/dynamic-input-types.mjs"
import BaseAttributeListItemViewModel from "./base-attribute/base-attribute-list-item-viewmodel.mjs"

/**
 * @property {TransientSkill} document
 */
export default class SkillListItemViewModel extends BaseListItemViewModel {
  /**
   * Returns true, if the expertise list should be visible. 
   * @type {Boolean}
   * @readonly
   */
  get isExpertiseListVisible() { return (this.isEditable === true) || this.document.expertises.length !== 0 }

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

    const attributeOptions = this.document.baseAttributes.map(baseAttribute => 
      new ChoiceOption({
        value: baseAttribute.name,
        localizedValue: game.i18n.localize(baseAttribute.localizableName),
      })
    );
    this.vmActiveAttribute = new InputDropDownViewModel({
      id: "vmActiveAttribute",
      parent: this,
      isEditable: (this.isEditable && attributeOptions.length > 1),
      options: attributeOptions,
      value: attributeOptions.find(it => it.value === this.document.activeBaseAttribute.name),
      onChange: (_, newValue) => {
        this.document.activeBaseAttribute = ATTRIBUTES[newValue];
      },
      adapter: new ChoiceAdapter({
        toChoiceOption(obj) {
          return attributeOptions.find(it => it.value === obj.name);
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
    if (this.showExpertises === true) {
      this.vmExpertiseTable = new ExpertiseTableViewModel({
        id: "vmExpertiseTable",
        parent: this,
        isEditable: this.isEditable,
        isSendable: this.isSendable,
        isOwner: this.isOwner,
        document: this.document,
        expertisesInitiallyVisible: true,
      });
    }
    this.expertisesTemplate = ExpertiseTableViewModel.TEMPLATE;
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
        placeholder: game.i18n.localize("ambersteel.character.skill.expertise.condition.placeholder"),
        localizedIconToolTip: game.i18n.localize("ambersteel.character.skill.expertise.condition.label"),
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
        placeholder: game.i18n.localize("ambersteel.character.skill.expertise.distance.placeholder"),
        localizedIconToolTip: game.i18n.localize("ambersteel.character.skill.expertise.distance.label"),
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
      // Edit button
      new TemplatedComponent({
        template: ButtonViewModel.TEMPLATE,
        viewModel: new ButtonViewModel({
          id: "vmBtnEdit",
          parent: this,
          iconHtml: '<i class="fas fa-cog"></i>',
          localizedTooltip: game.i18n.localize("ambersteel.general.edit"),
          onClick: async () => {
            const delta = await this._queryAttributesConfiguration();
            if (isDefined(delta) !== true) return;
            this.document.baseAttributes = delta;
          },
        }),
      }),
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
          .concat(ButtonContextMenuViewModel.createToggleButtons("ambersteel.character.skill.expertise.apCost", this.document, "apCost", 0))
          // Toggle obstacle
          .concat(ButtonContextMenuViewModel.createToggleButtons("ambersteel.roll.obstacle.label", this.document, "obstacle", ""))
          // Toggle opposed by
          .concat(ButtonContextMenuViewModel.createToggleButtons("ambersteel.roll.obstacle.opposedBy.label", this.document, "opposedBy", ""))
          // Toggle distance
          .concat(ButtonContextMenuViewModel.createToggleButtons("ambersteel.character.skill.expertise.distance.label", this.document, "distance", ""))
          // Toggle attack type
          .concat(ButtonContextMenuViewModel.createToggleButtons("ambersteel.attackType.label", this.document, "attackType", ATTACK_TYPES.none))
          // Toggle condition
          .concat(ButtonContextMenuViewModel.createToggleButtons("ambersteel.character.skill.expertise.condition.label", this.document, "condition", "")),
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

  /**
   * Prompts the user to configure the base attributes of the skill and 
   * returns the updated list. 
   * 
   * @returns {Array<Attribute>}
   * 
   * @private
   * @async
   */
  async _queryAttributesConfiguration() {
    const inputAttributes = "attributes";
    const baseAttributes = this.document.baseAttributes.concat([]); // Safe copy

    const dialog = await new DynamicInputDialog({
      localizedTitle: StringUtil.format(
        game.i18n.localize("ambersteel.general.input.queryFor"), 
        this.document.name, 
      ),
      inputDefinitions: [
        new DynamicInputDefinition({
          type: DYNAMIC_INPUT_TYPES.SIMPLE_LIST,
          name: inputAttributes,
          localizedLabel: game.i18n.localize("ambersteel.character.attribute.plural"),
          required: true,
          defaultValue: baseAttributes,
          validationFunc: (value) => {
            return value.length > 0;
          },
          specificArgs: {
            contentItemTemplate: BaseAttributeListItemViewModel.TEMPLATE,
            contentItemViewModelFactory: (index, attributes) => {
              return new BaseAttributeListItemViewModel({
                id: `vmAttribute${index}`,
                isEditable: true,
                attribute: attributes[index],
                onChange: (newAttributeValueName) => {
                  const newAttributeValue = ATTRIBUTES[newAttributeValueName];
                  attributes[index] = newAttributeValue;
                },
              })
            },
            newItemDefaultValue: ATTRIBUTES.agility,
            isItemAddable: this.isEditable,
            isItemRemovable: this.isEditable,
            localizedAddLabel: game.i18n.localize("ambersteel.general.add"),
          },
        }),
      ],
    }).renderAndAwait(true);
    
    if (dialog.confirmed !== true) return;
  
    return dialog[inputAttributes];
  }
}
