import { DAMAGE_TYPES } from "../../../../business/ruleset/damage-types.mjs"
import { ATTACK_TYPES } from "../../../../business/ruleset/skill/attack-types.mjs"
import { createUUID } from "../../../../business/util/uuid-utility.mjs"
import { validateOrThrow } from "../../../../business/util/validation-utility.mjs"
import ButtonAddViewModel, { ADD_BUTTON_CREATION_TYPES } from "../../../component/button-add/button-add-viewmodel.mjs"
import ButtonToggleVisibilityViewModel from "../../../component/button-toggle-visibility/button-toggle-visibility-viewmodel.mjs"
import DocumentListItemOrderDataSource from "../../../component/sortable-list/document-list-item-order-datasource.mjs"
import SortableListViewModel from "../../../component/sortable-list/sortable-list-viewmodel.mjs"
import { TEMPLATES } from "../../../templatePreloader.mjs"
import ViewModel from "../../../view-model/view-model.mjs"
import SkillAbilityListItemViewModel from "./skill-ability-list-item-viewmodel.mjs"

export default class SkillAbilityTableViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.SKILL_ABILITY_TABLE; }

  /**
   * @type {TransientSkill}
   * @readonly
   */
  document = undefined;

  /**
   * @type {Boolean}
   * @private
   */
  _isExpanded = false;
  /**
   * @type {Boolean}
   */
  get isExpanded() {
    return this._isExpanded;
  }
  set isExpanded(value) {
    this._isExpanded = value;

    const headerExpansionButtonIcon = this.element.find(`#${this.vmToggleExpansion1.id}-icon`);
    if (value === true) {
      headerExpansionButtonIcon.addClass("fa-angle-double-up");
      headerExpansionButtonIcon.removeClass("fa-angle-double-down");
    } else {
      headerExpansionButtonIcon.addClass("fa-angle-double-down");
      headerExpansionButtonIcon.removeClass("fa-angle-double-up");
    }

    // Immediately write view state. 
    this.writeViewState();
  }

  /**
   * @type {String}
   * @readonly
   */
  visGroupId = undefined;

  /**
   * @type {Array<ChoiceOption>}
   * @readonly
   */
  get attackTypeOptions() { return ATTACK_TYPES.asChoices(); }

  /**
   * @type {Array<ChoiceOption>}
   * @readonly
   */
  get damageTypeOptions() { return DAMAGE_TYPES.asChoices(); }

  /**
   * @type {Array<SkillAbilityListItemViewModel>}
   * @readonly
   */
  abilities = [];

  /**
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * 
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * 
   * @param {TransientSkill} args.document
   * @param {String | undefined} args.visGroupId
   * @param {Boolean | undefined} args.skillAbilitiesInitiallyVisible
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["document"]);

    // Own properties.
    this.document = args.document;
    this.visGroupId = args.visGroupId ?? createUUID();
    this._isExpanded = args.skillAbilitiesInitiallyVisible ?? false;
    
    this.registerViewStateProperty("_isExpanded");

    // Child view models. 
    this.contextTemplate = "skill-ability-table";
    const thiz = this;

    this.vmAddSkillAbility = new ButtonAddViewModel({
      id: "vmAddSkillAbility",
      parent: this,
      localizedToolTip: game.i18n.localize("ambersteel.character.skill.ability.add.label"),
      target: this.document,
      creationType: ADD_BUTTON_CREATION_TYPES.SKILL_ABILITY,
    });

    this.abilities = [];
    this.abilities = this._getSkillAbilityViewModels();

    this.vmSkillAbilities = new SortableListViewModel({
      parent: thiz,
      isEditable: args.isEditable ?? thiz.isEditable,
      id: "vmSkillAbilities",
      indexDataSource: new DocumentListItemOrderDataSource({
        document: thiz.document,
        listName: "abilities",
      }),
      listItemViewModels: this.abilities,
      listItemTemplate: SkillAbilityListItemViewModel.TEMPLATE,
      vmBtnAddItem: new ButtonAddViewModel({
        id: "vmBtnAdd",
        parent: this,
        target: thiz.document,
        isEditable: this.isEditable,
        creationType: "skill-ability",
        withDialog: false,
        localizedLabel: game.i18n.localize("ambersteel.character.skill.ability.add.label"),
        localizedType: game.i18n.localize("ambersteel.character.skill.ability.singular"),
      }),
    });

    this.vmToggleExpansion1 = new ButtonToggleVisibilityViewModel({
      parent: thiz,
      id: "vmToggleExpansion1",
      target: thiz.document,
      isEditable: true,
      visGroup: thiz.visGroupId,
      toggleSelf: false,
      onClick: async (event, data) => {
        this.isExpanded = !this.isExpanded;
      },
    });
    this.vmToggleExpansion2 = new ButtonToggleVisibilityViewModel({
      parent: thiz,
      id: "vmToggleExpansion2",
      target: thiz.document,
      isEditable: true,
      visGroup: thiz.visGroupId,
      toggleSelf: true,
      onClick: async (event, data) => {
        this.isExpanded = !this.isExpanded;
      },
    });
  }

  /**
   * Updates the data of this view model. 
   * 
   * @param {Boolean | undefined} args.isEditable If true, the view model data is editable.
   * * Default `false`. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat.
   * * Default `false`. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document.
   * * Default `false`. 
   * 
   * @override
   */
  update(args = {}) {
    this.abilities = this._getSkillAbilityViewModels();

    super.update(args);
  }

  /** @override */
  _getChildUpdates() {
    const updates = super._getChildUpdates();

    updates.set(this.vmSkillAbilities, {
      ...updates.get(this.vmSkillAbilities),
      listItemViewModels: this.abilities,
      isEditable: args.isEditable ?? thiz.isEditable,
    });
    
    return updates;
  }

  /**
   * @returns {Array<SkillAbilityListItemViewModel>}
   * 
   * @private
   */
  _getSkillAbilityViewModels() {
    const result = [];
    const skillAbilities = this.document.abilities;
    for (const skillAbility of skillAbilities) {
      const vm = new SkillAbilityListItemViewModel({
        id: skillAbility.id,
        isEditable: this.isEditable,
        isSendable: this.isSendable,
        isOwner: this.isOwner,
        document: skillAbility,
      });
      result.push(vm);
      this[vm._id] = vm;
    }
    return result;
  }
}
