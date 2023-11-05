import { DAMAGE_TYPES } from "../../../../business/ruleset/damage-types.mjs"
import { ATTACK_TYPES } from "../../../../business/ruleset/skill/attack-types.mjs"
import { createUUID } from "../../../../business/util/uuid-utility.mjs"
import { validateOrThrow } from "../../../../business/util/validation-utility.mjs"
import DocumentListItemOrderDataSource from "../../../component/sortable-list/document-list-item-order-datasource.mjs"
import SortableListViewModel from "../../../component/sortable-list/sortable-list-viewmodel.mjs"
import { TEMPLATES } from "../../../templatePreloader.mjs"
import ViewModelFactory from "../../../view-model/view-model-factory.mjs"
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
  _skillAbilitiesInitiallyVisible = false;
  /**
   * @type {Boolean}
   */
  get skillAbilitiesInitiallyVisible() {
    return this._skillAbilitiesInitiallyVisible;
  }
  set skillAbilitiesInitiallyVisible(value) {
    this._skillAbilitiesInitiallyVisible = value;

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
    this._skillAbilitiesInitiallyVisible = args.skillAbilitiesInitiallyVisible ?? false;
    
    this.registerViewStateProperty("_skillAbilitiesInitiallyVisible");

    // Child view models. 
    this.contextTemplate = "skill-ability-table";
    const thiz = this;
    const factory = new ViewModelFactory();

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
      listItemTemplate: TEMPLATES.SKILL_ABILITY_LIST_ITEM,
      vmBtnAddItem: factory.createVmBtnAdd({
        id: "vmBtnAdd",
        target: thiz.document,
        isEditable: this.isEditable,
        creationType: "skill-ability",
        withDialog: false,
        localizedLabel: game.i18n.localize("ambersteel.character.skill.ability.add.label"),
        localizedType: game.i18n.localize("ambersteel.character.skill.ability.singular"),
      }),
    });

    this.vmBtnToggleVisibilityExpand = factory.createVmBtnToggleVisibility({
      parent: thiz,
      id: "vmBtnToggleVisibilityExpand",
      target: thiz.document,
      isEditable: true,
      visGroup: thiz.visGroupId,
      toggleSelf: true,
      callback: thiz._toggleSkillAbilitiesInitiallyVisible.bind(thiz),
    });
    this.vmBtnToggleVisibilityCollapse = factory.createVmBtnToggleVisibility({
      parent: thiz,
      id: "vmBtnToggleVisibilityCollapse",
      target: thiz.document,
      isEditable: true,
      visGroup: thiz.visGroupId,
      toggleSelf: true,
      callback: thiz._toggleSkillAbilitiesInitiallyVisible.bind(thiz),
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
        skillAbility: skillAbility,
      });
      result.push(vm);
      this[vm._id] = vm;
    }
    return result;
  }

  /**
   * @private
   */
  async _toggleSkillAbilitiesInitiallyVisible() {
    this.skillAbilitiesInitiallyVisible = !this.skillAbilitiesInitiallyVisible;
  }
}
