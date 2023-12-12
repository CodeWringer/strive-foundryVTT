import { SKILL_TAGS } from "../../../../business/tags/system-tags.mjs";
import { ATTRIBUTES } from "../../../../business/ruleset/attribute/attributes.mjs";
import SkillPrerequisite from "../../../../business/ruleset/skill/skill-prerequisite.mjs";
import { isDefined } from "../../../../business/util/validation-utility.mjs";
import { validateOrThrow } from "../../../../business/util/validation-utility.mjs";
import ChoiceAdapter from "../../../component/input-choice/choice-adapter.mjs";
import InputTagsViewModel from "../../../component/input-tags/input-tags-viewmodel.mjs";
import SimpleListItemViewModel from "../../../component/simple-list/simple-list-item-viewmodel.mjs";
import SimpleListViewModel from "../../../component/simple-list/simple-list-viewmodel.mjs";
import { TEMPLATES } from "../../../templatePreloader.mjs"
import SkillAbilityTableViewModel from "../skill-ability/skill-ability-table-viewmodel.mjs"
import SkillPrerequisiteListItemViewModel from "./skill-prerequisite-list-item-viewmodel.mjs";
import InputImageViewModel from "../../../component/input-image/input-image-viewmodel.mjs";
import InputRichTextViewModel from "../../../component/input-rich-text/input-rich-text-viewmodel.mjs";
import InputTextFieldViewModel from "../../../component/input-textfield/input-textfield-viewmodel.mjs";
import InputDropDownViewModel from "../../../component/input-dropdown/input-dropdown-viewmodel.mjs";
import ButtonSendToChatViewModel from "../../../component/button-send-to-chat/button-send-to-chat-viewmodel.mjs";
import ButtonContextMenuViewModel from "../../../component/button-context-menu/button-context-menu-viewmodel.mjs";
import DamageAndType from "../../../../business/ruleset/skill/damage-and-type.mjs";
import { DAMAGE_TYPES } from "../../../../business/ruleset/damage-types.mjs";
import { ATTACK_TYPES, getAttackTypeIconClass } from "../../../../business/ruleset/skill/attack-types.mjs";
import ViewModel from "../../../view-model/view-model.mjs";
import DynamicInputDialog from "../../../dialog/dynamic-input-dialog/dynamic-input-dialog.mjs";
import DynamicInputDefinition from "../../../dialog/dynamic-input-dialog/dynamic-input-definition.mjs";
import { DYNAMIC_INPUT_TYPES } from "../../../dialog/dynamic-input-dialog/dynamic-input-types.mjs";
import InfoBubble, { InfoBubbleAutoHidingTypes, InfoBubbleAutoShowingTypes } from "../../../component/info-bubble/info-bubble.mjs";
import InputNumberSpinnerViewModel from "../../../component/input-number-spinner/input-number-spinner-viewmodel.mjs";
import DamageDefinitionListViewModel from "../../../component/damage-definition-list/damage-definition-list-viewmodel.mjs";

export default class SkillItemSheetViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.SKILL_ITEM_SHEET; }

  /** @override */
  get entityId() { return this.document.id; }

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
   * @type {String}
   * @readonly
   */
  get prerequisiteListItemTemplate() { return SkillPrerequisiteListItemViewModel.TEMPLATE; }

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

  /**
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
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

    this.document = args.document;

    // Child view models. 
    this.vmImg = new InputImageViewModel({
      parent: this,
      id: "vmImg",
      value: this.document.img,
      onChange: (_, newValue) => {
        this.document.img = newValue;
      },
    });
    this.vmBtnContextMenu = new ButtonContextMenuViewModel({
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
    });
    this.vmTfName = new InputTextFieldViewModel({
      parent: this,
      id: "vmTfName",
      value: this.document.name,
      onChange: (_, newValue) => {
        this.document.name = newValue;
      },
      placeholder: game.i18n.localize("ambersteel.general.name.label"),
    });
    this.vmBtnSendToChat = new ButtonSendToChatViewModel({
      parent: this,
      id: "vmBtnSendToChat",
      target: this.document,
      isEditable: this.isEditable || this.isGM,
    });
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
      placeholder: game.i18n.localize("ambersteel.general.category"),
    });
    this.vmRtDescription = new InputRichTextViewModel({
      parent: this,
      id: "vmRtDescription",
      value: this.document.description,
      onChange: (_, newValue) => {
        this.document.description = newValue;
      },
    });
    this.vmSkillAbilityTable = new SkillAbilityTableViewModel({
      id: "vmSkillAbilityTable",
      parent: this,
      document: this.document,
      skillAbilitiesInitiallyVisible: true,
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
    this.vmTfObstacle = new InputTextFieldViewModel({
      parent: this,
      id: "vmTfObstacle",
      value: this.document.obstacle,
      onChange: (_, newValue) => {
        this.document.obstacle = newValue;
      },
      propertyPath: "obstacle",
      placeholder: game.i18n.localize("ambersteel.roll.obstacle.placeholder"),
    });
    this.vmTfOpposedBy = new InputTextFieldViewModel({
      parent: this,
      id: "vmTfOpposedBy",
      value: this.document.opposedBy,
      onChange: (_, newValue) => {
        this.document.opposedBy = newValue;
      },
      placeholder: game.i18n.localize("ambersteel.roll.obstacle.opposedBy.placeholder"),
    });
    this.vmTfDistance = new InputTextFieldViewModel({
      parent: this,
      id: "vmTfDistance",
      value: this.document.distance,
      onChange: (_, newValue) => {
        this.document.distance = newValue;
      },
      placeholder: game.i18n.localize("ambersteel.character.skill.ability.distance.placeholder"),
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
    this.vmDdAttackType = new InputDropDownViewModel({
      id: "vmDdAttackType",
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
    });
    this.vmCondition = new InputTextFieldViewModel({
      parent: this,
      id: "vmCondition",
      value: this.document.condition,
      onChange: (_, newValue) => {
        this.document.condition = newValue;
      },
      placeholder: game.i18n.localize("ambersteel.character.skill.ability.condition.placeholder"),
    });
    this.vmDamageDefinitionList = new DamageDefinitionListViewModel({
      id: `vmDamageDefinitionList`,
      parent: this,
      value: this.document.damage,
      onChange: (_, newValue) => {
        this.document.damage = newValue;
      },
      resolveFormulaContext: this._getRootOwningDocument(this.document),
      chatTitle: `${game.i18n.localize("ambersteel.damageDefinition.label")} - ${this.document.name}`,
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
      onAddClick: this._onClickAddPrerequisite.bind(this),
      onRemoveClick: this._onClickRemovePrerequisite.bind(this),
      isItemAddable: true,
      isItemRemovable: true,
      localizedAddLabel: game.i18n.localize("ambersteel.general.add"),
    });
  }

  /**
   * Prompts the user to enter a name and applies it. 
   * 
   * @protected
   */
  async queryEditName() {
    const inputName = "inputName";

    const dialog = await new DynamicInputDialog({
      localizedTitle: `${format(game.i18n.localize("ambersteel.general.name.editOf"), this.document.name)}`,
      inputDefinitions: [
        new DynamicInputDefinition({
          type: DYNAMIC_INPUT_TYPES.TEXTFIELD,
          name: inputName,
          localizedLabel: game.i18n.localize("ambersteel.general.name.label"),
          required: true,
          defaultValue: this.document.name,
          validationFunc: (str) => {
            return str.trim().length > 0;
          },
        }),
      ],
    }).renderAndAwait(true);

    if (dialog.confirmed !== true) return;

    this.document.name = dialog[inputName];
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
  _getChildUpdates() {
    const updates = super._getChildUpdates();

    updates.set(this.vmBtnSendToChat, {
      ...updates.get(this.vmBtnSendToChat),
      isEditable: this.isEditable || this.isGM,
    });

    return updates;
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
        onChange: (state) => {
          this._updatePrerequisitesFromViewModels();
        }
      });
      result.push(vm);
    }
    return result;
  }

  /**
   * Event handler for when a new skill prerequisite is added. 
   * 
   * @private
   */
  _onClickAddPrerequisite() {
    const prerequisites = this.document.prerequisites.concat([
      new SkillPrerequisite()
    ]);
    this.document.prerequisites = prerequisites;
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

  /**
   * Event handler for when a skill prerequisite is to be removed. 
   * 
   * @param {SimpleListItemViewModel} viewModel
   * 
   * @private
   */
  _onClickRemovePrerequisite(viewModel) {
    const index = this.prerequisiteViewModels.indexOf(viewModel.itemViewModel);
    const safeCopy = this.document.prerequisites.concat([]);
    safeCopy.splice(index, 1);
    this.document.prerequisites = safeCopy;
  }

  /**
   * Updates the remote prerequisites array with the states gathered 
   * from `this.prerequisiteViewModels`. 
   * 
   * @private
   */
  _updatePrerequisitesFromViewModels() {
    const prerequisites = this.prerequisiteViewModels.map(viewModel => 
      viewModel.state
    );
    this.document.prerequisites = prerequisites;
  }
}
