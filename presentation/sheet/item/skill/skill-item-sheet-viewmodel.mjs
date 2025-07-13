import { SKILL_TAGS } from "../../../../business/tags/system-tags.mjs";
import SkillPrerequisite from "../../../../business/ruleset/skill/skill-prerequisite.mjs";
import InputTagsViewModel from "../../../component/input-tags/input-tags-viewmodel.mjs";
import SimpleListViewModel from "../../../component/simple-list/simple-list-viewmodel.mjs";
import ExpertiseTableViewModel from "../expertise/expertise-table-viewmodel.mjs"
import SkillPrerequisiteListItemViewModel from "./skill-prerequisite-list-item-viewmodel.mjs";
import InputTextFieldViewModel from "../../../component/input-textfield/input-textfield-viewmodel.mjs";
import InputDropDownViewModel from "../../../component/input-choice/input-dropdown/input-dropdown-viewmodel.mjs";
import ButtonContextMenuViewModel, { ContextMenuItem } from "../../../component/button-context-menu/button-context-menu-viewmodel.mjs";
import DamageAndType from "../../../../business/ruleset/skill/damage-and-type.mjs";
import { DAMAGE_TYPES } from "../../../../business/ruleset/damage-types.mjs";
import { ATTACK_TYPES, getAttackTypeIconClass } from "../../../../business/ruleset/skill/attack-types.mjs";
import InputNumberSpinnerViewModel from "../../../component/input-number-spinner/input-number-spinner-viewmodel.mjs";
import DamageDefinitionListViewModel from "../../../component/damage-definition-list/damage-definition-list-viewmodel.mjs";
import BaseItemSheetViewModel from "../base/base-item-sheet-viewmodel.mjs";
import { DataFieldComponent } from "../base/datafield-component.mjs";
import { TemplatedComponent } from "../base/templated-component.mjs";
import TransientSkill from "../../../../business/document/item/skill/transient-skill.mjs";
import BaseAttributeListItemViewModel from "./base-attribute/base-attribute-list-item-viewmodel.mjs";
import { ATTRIBUTES } from "../../../../business/ruleset/attribute/attributes.mjs";
import ButtonViewModel from "../../../component/button/button-viewmodel.mjs";
import { StringUtil } from "../../../../business/util/string-utility.mjs";
import { ExtenderUtil } from "../../../../common/extender-util.mjs";
import { ValidationUtil } from "../../../../business/util/validation-utility.mjs";
import ViewModel from "../../../view-model/view-model.mjs";

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
   * @type {String}
   * @readonly
   */
  get templateExpertiseTable() { return ExpertiseTableViewModel.TEMPLATE; }

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
          onChange: (_, newValue) => {
            this.document.apCost = newValue;
          },
          min: 0,
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
      expertisesInitiallyVisible: this.document.expertises.length > 0,
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
      chatTitle: `${game.i18n.localize("system.damageDefinition.label")} - ${this.document.name}`,
    });
    this.vmDamageFormulaInfo = new ViewModel({
      id: "damage-info",
      parent: this,
      localizedToolTip: game.i18n.localize("system.damageDefinition.infoFormulae"),
    });

    this.vmBaseAttributeList = new SimpleListViewModel({
      id: "vmBaseAttributeList",
      parent: this,
      value: this.document.baseAttributes.concat([]),
      contentItemTemplate: BaseAttributeListItemViewModel.TEMPLATE,
      contentItemViewModelFactory: (index, attribute) => {
        return new BaseAttributeListItemViewModel({
          id: `vmAttribute${index}`,
          isEditable: true,
          attribute: attribute,
        })
      },
      newItemDefaultValue: ATTRIBUTES.agility,
      isItemAddable: this.isEditable,
      isItemRemovable: (this.isEditable && this.document.baseAttributes.length > 1),
      localizedAddLabel: StringUtil.format(
        game.i18n.localize("system.general.add.addType"),
        game.i18n.localize("system.character.attribute.singular")
      ),
      onChange: (oldValue, newValue) => {
        this.document.baseAttributes = newValue;
      },
    });
    this.vmAddAttribute2 = new ButtonViewModel({
      id: "vmAddAttribute2",
      parent: this,
      iconHtml: '<i class="fas fa-plus"></i>',
      localizedToolTip: StringUtil.format(
        game.i18n.localize("system.general.add.addType"),
        game.i18n.localize("system.character.attribute.singular")
      ),
      onClick: () => {
        const baseAttributes = this.document.baseAttributes.concat([
          ATTRIBUTES.agility
        ]);
        this.document.baseAttributes = baseAttributes;
      },
    });

    this.vmPrerequisiteList = new SimpleListViewModel({
      id: "vmPrerequisiteList",
      parent: this,
      value: this.document.prerequisites.concat([]),
      contentItemTemplate: SkillPrerequisiteListItemViewModel.TEMPLATE,
      contentItemViewModelFactory: (index, prerequisite) => {
        return new SkillPrerequisiteListItemViewModel({
          id: `vmAttribute${index}`,
          isEditable: true,
          stateId: (prerequisite ?? {}).id,
          stateName: (prerequisite ?? {}).name,
          stateMinimumLevel: ((prerequisite ?? {}).minimumLevel ?? 0),
        });
      },
      newItemDefaultValue: new SkillPrerequisite(),
      isItemAddable: this.isEditable,
      isItemRemovable: this.isEditable,
      localizedAddLabel: StringUtil.format(
        game.i18n.localize("system.general.add.addType"),
        game.i18n.localize("system.character.skill.prerequisite.singular")
      ),
      onChange: (oldValue, newValue) => {
        this.document.prerequisites = newValue;
      },
    });
    this.vmAddPrerequisite2 = new ButtonViewModel({
      id: "vmAddPrerequisite2",
      parent: this,
      iconHtml: '<i class="fas fa-plus"></i>',
      localizedToolTip: StringUtil.format(
        game.i18n.localize("system.general.add.addType"),
        game.i18n.localize("system.character.skill.prerequisite.singular")
      ),
      onClick: () => {
        const prerequisites = this.document.prerequisites.concat([
          new SkillPrerequisite()
        ]);
        this.document.prerequisites = prerequisites;
      },
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
          ]
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
            )
        }),
      }),
    ].concat(inherited);
  }

  /** @override */
  getAdditionalContent() {
    return new TemplatedComponent({
      template: game.strive.const.TEMPLATES.SKILL_ITEM_SHEET_EXTRA_CONTENT,
      viewModel: this,
    });
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

  /** @override */
  getExtenders() {
    return super.getExtenders().concat(ExtenderUtil.getExtenders(SkillItemSheetViewModel));
  }

}
