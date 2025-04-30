import { DAMAGE_TYPES } from "../../../../business/ruleset/damage-types.mjs";
import { ATTACK_TYPES, getAttackTypeIconClass } from "../../../../business/ruleset/skill/attack-types.mjs";
import DamageAndType from "../../../../business/ruleset/skill/damage-and-type.mjs";
import ViewModel from "../../../view-model/view-model.mjs";
import DamageDefinitionListViewModel from "../../../component/damage-definition-list/damage-definition-list-viewmodel.mjs";
import InputDropDownViewModel from "../../../component/input-choice/input-dropdown/input-dropdown-viewmodel.mjs";
import InputNumberSpinnerViewModel from "../../../component/input-number-spinner/input-number-spinner-viewmodel.mjs";
import Expertise from "../../../../business/document/item/skill/expertise.mjs";
import InputTextFieldViewModel from "../../../component/input-textfield/input-textfield-viewmodel.mjs";
import ButtonRollViewModel from "../../../component/button-roll/button-roll-viewmodel.mjs";
import ButtonContextMenuViewModel from "../../../component/button-context-menu/button-context-menu-viewmodel.mjs";
import ButtonDeleteViewModel from "../../../component/button-delete/button-delete-viewmodel.mjs";
import BaseListItemViewModel from "../base/base-list-item-viewmodel.mjs";
import { DataFieldComponent } from "../base/datafield-component.mjs";
import { TemplatedComponent } from "../base/templated-component.mjs";
import Ruleset from "../../../../business/ruleset/ruleset.mjs";
import { StringUtil } from "../../../../business/util/string-utility.mjs";
import { ExtenderUtil } from "../../../../common/extender-util.mjs";
import { ValidationUtil } from "../../../../business/util/validation-utility.mjs";

/**
 * @property {Expertise} document 
 */
export default class ExpertiseListItemViewModel extends BaseListItemViewModel {
  /**
   * @type {Array<ChoiceOption>}
   * @readonly
   */
  get attackTypeOptions() { return ATTACK_TYPES.asChoices(); }

  /**
   * @type {Boolean}
   * @readonly
   */
  get hideObstacle() { return ValidationUtil.isDefined(this.document.obstacle) !== true; }

  /**
   * @type {Boolean}
   * @readonly
   */
  get hideOpposedBy() { return ValidationUtil.isDefined(this.document.opposedBy) !== true; }

  /**
   * @type {Boolean}
   * @readonly
   */
  get hideCondition() { return ValidationUtil.isDefined(this.document.condition) !== true; }

  /**
   * @type {Boolean}
   * @readonly
   */
  get hideDistance() { return ValidationUtil.isDefined(this.document.distance) !== true; }

  /**
   * @type {Boolean}
   * @readonly
   */
  get hideAttackType() { return ValidationUtil.isDefined(this.document.attackType) !== true; }

  /**
   * @type {Boolean}
   * @readonly
   */
  get hideDamage() { return this.document.damage.length < 1; }

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
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * 
   * @param {Expertise} args.document 
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["document"]);

    this.vmNsRequiredLevel = new InputNumberSpinnerViewModel({
      parent: this,
      id: "vmNsRequiredLevel",
      value: this.document.requiredLevel,
      onChange: (_, newValue) => {
        this.document.requiredLevel = newValue;
      },
      min: 0,
    });
    this.vmNsApCost = new InputNumberSpinnerViewModel({
      parent: this,
      id: "vmNsApCost",
      value: this.document.apCost,
      onChange: (_, newValue) => {
        this.document.apCost = newValue;
      },
      min: 0,
    });
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
  }

  /** @override */
  getDataFields() {
    const attackTypeChoices = ATTACK_TYPES.asChoices();

    return [
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
    const owningDocument = this.getRootOwningDocument();
    return [
      new TemplatedComponent({
        template: ButtonRollViewModel.TEMPLATE,
        viewModel: new ButtonRollViewModel({
          parent: this,
          id: "vmBtnRoll",
          target: owningDocument,
          rollSchema: new Ruleset().getSkillRollSchema(),
          primaryChatTitle: game.i18n.localize(this.document.name),
          primaryChatImage: this.document.img,
          secondaryChatTitle: game.i18n.localize(owningDocument.name),
          secondaryChatImage: owningDocument.img,
          actor: owningDocument.owningDocument,
        }),
        isHidden: ValidationUtil.isDefined(owningDocument.owningDocument) === false,
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
              name: game.i18n.localize("system.general.name.edit"),
              icon: '<i class="fas fa-edit"></i>',
              condition: this.isEditable,
              callback: this.queryEditName.bind(this),
            },
            // Add damage
            {
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
            },
          ]
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
      template: game.strive.const.TEMPLATES.EXPERTISE_LIST_ITEM_EXTRA_HEADER,
      viewModel: this,
    });
  }

  /** @override */
  getAdditionalContent() {
    if (this.hideDamage === false) {
      return new TemplatedComponent({
        template: game.strive.const.TEMPLATES.EXPERTISE_LIST_ITEM_EXTRA_CONTENT,
        viewModel: this,
      });
    }
  }

  /** @override */
  getExtenders() {
    return super.getExtenders().concat(ExtenderUtil.getExtenders(ExpertiseListItemViewModel));
  }

}
