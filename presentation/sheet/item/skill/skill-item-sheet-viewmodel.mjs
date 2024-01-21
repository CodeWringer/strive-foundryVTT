import { SKILL_TAGS } from "../../../../business/tags/system-tags.mjs";
import SkillPrerequisite from "../../../../business/ruleset/skill/skill-prerequisite.mjs";
import { isDefined } from "../../../../business/util/validation-utility.mjs";
import ChoiceAdapter from "../../../component/input-choice/choice-adapter.mjs";
import InputTagsViewModel from "../../../component/input-tags/input-tags-viewmodel.mjs";
import SimpleListItemViewModel from "../../../component/simple-list/simple-list-item-viewmodel.mjs";
import SimpleListViewModel from "../../../component/simple-list/simple-list-viewmodel.mjs";
import ExpertiseTableViewModel from "../expertise/expertise-table-viewmodel.mjs"
import SkillPrerequisiteListItemViewModel from "./skill-prerequisite-list-item-viewmodel.mjs";
import InputTextFieldViewModel from "../../../component/input-textfield/input-textfield-viewmodel.mjs";
import InputDropDownViewModel from "../../../component/input-dropdown/input-dropdown-viewmodel.mjs";
import ButtonContextMenuViewModel from "../../../component/button-context-menu/button-context-menu-viewmodel.mjs";
import DamageAndType from "../../../../business/ruleset/skill/damage-and-type.mjs";
import { DAMAGE_TYPES } from "../../../../business/ruleset/damage-types.mjs";
import { ATTACK_TYPES, getAttackTypeIconClass } from "../../../../business/ruleset/skill/attack-types.mjs";
import InfoBubble, { InfoBubbleAutoHidingTypes, InfoBubbleAutoShowingTypes } from "../../../component/info-bubble/info-bubble.mjs";
import InputNumberSpinnerViewModel from "../../../component/input-number-spinner/input-number-spinner-viewmodel.mjs";
import DamageDefinitionListViewModel from "../../../component/damage-definition-list/damage-definition-list-viewmodel.mjs";
import BaseItemSheetViewModel from "../base/base-item-sheet-viewmodel.mjs";
import { DataFieldComponent } from "../base/datafield-component.mjs";
import { TemplatedComponent } from "../base/templated-component.mjs";
import { TEMPLATES } from "../../../templatePreloader.mjs";
import TransientSkill from "../../../../business/document/item/skill/transient-skill.mjs";
import BaseAttributeListItemViewModel from "./base-attribute/base-attribute-list-item-viewmodel.mjs";
import { ATTRIBUTES } from "../../../../business/ruleset/attribute/attributes.mjs";

/**
 * @property {TransientSkill} document
 */
export default class SkillItemSheetViewModel extends BaseItemSheetViewModel {
  /**
   * Returns true, if the expertise list should be visible. 
   * @type {Boolean}
   * @readonly
   */
  get isExpertiseListVisible() { return (this.isEditable === true) || this.document.expertises.length !== 0 }

  /**
   * @type {String}
   * @readonly
   */
  get prerequisiteListItemTemplate() { return SkillPrerequisiteListItemViewModel.TEMPLATE; }

  /**
   * @type {String}
   * @readonly
   */
  get baseAttributeListItemTemplate() { return BaseAttributeListItemViewModel.TEMPLATE; }

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

  /**
   * @param {Object} args 
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * 
   * @param {TransientSkill} args.document 
   */
  constructor(args = {}) {
    super(args);

    this.vmExpertiseTable = new ExpertiseTableViewModel({
      id: "vmExpertiseTable",
      parent: this,
      document: this.document,
      expertisesInitiallyVisible: true,
    });
    this.vmTfCategory = new InputTextFieldViewModel({
      parent: this,
      id: "vmTfCategory",
      value: this.document.category,
      onChange: (_, newValue) => {
        this.document.category = newValue;
      },
      placeholder: game.i18n.localize("ambersteel.general.category"),
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
    
    this.vmDamageDefinitionList = new DamageDefinitionListViewModel({
      id: `vmDamageDefinitionList`,
      parent: this,
      value: this.document.damage,
      onChange: (_, newValue) => {
        this.document.damage = newValue;
      },
      resolveFormulaContext: this._getRootOwningDocument(this.document),
      chatTitle: `${game.i18n.localize("ambersteel.damageDefinition.formula")} - ${this.document.name}`,
    });

    this.baseAttributeViewModels = this._getBaseAttributeViewModels();
    this.vmBaseAttributeList = new SimpleListViewModel({
      id: "vmBaseAttributeList",
      parent: this,
      isEditable: this.isEditable,
      isSendable: this.isSendable,
      isOwner: this.isOwner,
      contentItemViewModels: this.baseAttributeViewModels,
      contentItemTemplate: this.baseAttributeListItemTemplate,
      onAddClick: () => {
        const baseAttributes = this.document.baseAttributes.concat([
          ATTRIBUTES.agility
        ]);
        this.document.baseAttributes = baseAttributes;
      },
      onRemoveClick: (_, index) => {
        const newBaseAttributes = this.document.baseAttributes.concat([]);
        newBaseAttributes.splice(index, 1);
        this.document.baseAttributes = newBaseAttributes;
      },
      isItemAddable: this.isEditable,
      isItemRemovable: (this.isEditable && this.baseAttributeViewModels.length > 1),
      localizedAddLabel: game.i18n.localize("ambersteel.general.add"),
    });

    this.prerequisiteViewModels = this._getPrerequisiteViewModels();
    this.vmPrerequisiteList = new SimpleListViewModel({
      id: "vmPrerequisiteList",
      parent: this,
      isEditable: this.isEditable,
      isSendable: this.isSendable,
      isOwner: this.isOwner,
      contentItemViewModels: this.prerequisiteViewModels,
      contentItemTemplate: this.prerequisiteListItemTemplate,
      onAddClick: () => {
        const prerequisites = this.document.prerequisites.concat([
          new SkillPrerequisite()
        ]);
        this.document.prerequisites = prerequisites;
      },
      onRemoveClick: (_, index) => {
        const newPrerequisites = this.document.prerequisites.concat([]);
        newPrerequisites.splice(index, 1);
        this.document.prerequisites = newPrerequisites;
      },
      isItemAddable: this.isEditable,
      isItemRemovable: this.isEditable,
      localizedAddLabel: game.i18n.localize("ambersteel.general.add"),
    });
  }

  /** @override */
  getSecondaryHeaderButtons() {
    const inherited = super.getSecondaryHeaderButtons();
    return [
      // Context menu button
      new TemplatedComponent({
        template: ButtonContextMenuViewModel.TEMPLATE,
        viewModel: new ButtonContextMenuViewModel({
          id: "vmBtnContextMenu",
          parent: this,
          menuItems: [
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
    ].concat(inherited);
  }

  /** @override */
  getAdditionalContent() {
    return new TemplatedComponent({
      template: TEMPLATES.SKILL_ITEM_SHEET_EXTRA_CONTENT,
      viewModel: this,
    });
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

  /**
   * @returns {Array<SkillPrerequisiteListItemViewModel>}
   * 
   * @private
   */
  _getPrerequisiteViewModels() {
    const result = [];

    const prerequisites = this.document.prerequisites;
    for (let index = 0; index < prerequisites.length; index++) {
      const prerequisite = prerequisites[index];

      const vm = new SkillPrerequisiteListItemViewModel({
        id: `vmPrerequisite${index}`,
        isEditable: this.isEditable,
        stateId: prerequisite.id,
        stateName: prerequisite.name,
        stateMinimumLevel: (prerequisite.minimumLevel ?? 0),
        onChange: () => {
          const prerequisites = this.prerequisiteViewModels.map(viewModel => 
            viewModel.state
          );
          this.document.prerequisites = prerequisites;
        },
      });
      result.push(vm);
    }
    return result;
  }

  /**
   * @returns {Array<BaseAttributeListItemViewModel>}
   * 
   * @private
   */
  _getBaseAttributeViewModels() {
    const result = [];

    const attributes = this.document.baseAttributes;
    for (let index = 0; index < attributes.length; index++) {
      const attribute = attributes[index];

      const vm = new BaseAttributeListItemViewModel({
        id: `vmAttribute${index}`,
        isEditable: this.isEditable,
        attribute: attribute,
        onChange: (newAttributeValueName) => {
          const newAttributeValue = ATTRIBUTES[newAttributeValueName];
          const newBaseAttributes = this.document.baseAttributes.concat([]);
          newBaseAttributes[index] = newAttributeValue;
          this.document.baseAttributes = newBaseAttributes;
        },
      });
      result.push(vm);
    }
    return result;
  }

  /**
   * Returns the root owning document of the skill, if it has one. 
   * Otherwise, returns the skill itself.  
   * 
   * @returns {TransientDocument | TransientSkill}
   * 
   * @private
   */
  _getRootOwningDocument() {
    if (this.document.owningDocument !== undefined) {
      return this.document.owningDocument;
    } else {
      return this.document;
    }
  }
}
