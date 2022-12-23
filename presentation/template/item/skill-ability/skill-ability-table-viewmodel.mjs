import { createUUID } from "../../../../business/util/uuid-utility.mjs"
import { validateOrThrow } from "../../../../business/util/validation-utility.mjs"
import DocumentListItemOrderDataSource from "../../../component/sortable-list/document-list-item-order-datasource.mjs"
import SortableListViewModel from "../../../component/sortable-list/sortable-list-viewmodel.mjs"
import ViewModel from "../../../view-model/view-model.mjs"
import ViewModelFactory from "../../../view-model/view-model-factory.mjs"
import { TEMPLATES } from "../../templatePreloader.mjs"
import SkillAbilityChatMessageViewModel from "./skill-ability-chat-message-viewmodel.mjs"
import SkillAbilityListItemViewModel from "./skill-ability-list-item-viewmodel.mjs"
import { DAMAGE_TYPES } from "../../../../business/ruleset/damage-types.mjs"
import { ATTACK_TYPES } from "../../../../business/ruleset/skill/attack-types.mjs"

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
    this.writeAllViewState();
  }

  /**
   * @type {Boolean}
   * @readonly
   */
  oneColumn = false;

  /**
   * @type {String}
   * @readonly
   */
  visGroupId = undefined;

  /**
   * @type {Array<ChoiceOption>}
   * @readonly
   */
  get attackTypeOptions() { return ATTACK_TYPES.asChoices; }

  /**
   * @type {Array<ChoiceOption>}
   * @readonly
   */
  get damageTypeOptions() { return DAMAGE_TYPES.asChoices; }

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
   * @param {Boolean | undefined} args.isGM If true, the current user is a GM. 
   * 
   * @param {TransientSkill} args.document
   * @param {Boolean | undefined} args.oneColumn
   * @param {String | undefined} args.visGroupId
   * @param {Boolean | undefined} args.skillAbilitiesInitiallyVisible
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["document"]);

    this.registerViewStateProperty("_skillAbilitiesInitiallyVisible");

    // Own properties.
    this.document = args.document;
    this.oneColumn = args.oneColumn ?? false;
    this.visGroupId = args.visGroupId ?? createUUID();
    this._skillAbilitiesInitiallyVisible = args.skillAbilitiesInitiallyVisible ?? false;

    // Child view models. 
    this.contextTemplate = "skill-ability-table";
    const thiz = this;
    const factory = new ViewModelFactory();

    for (const skillAbility of this.document.abilities) {
      let vm = undefined;

      if (this.oneColumn === true) {
        vm = new SkillAbilityChatMessageViewModel({
          id: `vmSkillAbility-${skillAbility.id}`,
          parent: thiz,
          isEditable: args.isEditable,
          isSendable: args.isSendable,
          isOwner: args.isOwner,
          isGM: args.isGM,
          skillAbility: skillAbility,
        })
      } else {
        vm = new SkillAbilityListItemViewModel({
          id: `vmSkillAbility-${skillAbility.id}`,
          parent: thiz,
          isEditable: args.isEditable,
          isSendable: args.isSendable,
          isOwner: args.isOwner,
          isGM: args.isGM,
          skillAbility: skillAbility,
        });
      }
      this.abilities.push(vm);
      this[vm.id] = vm;
    }

    this.vmSkillAbilities = new SortableListViewModel({
      parent: thiz,
      isEditable: args.isEditable ?? thiz.isEditable,
      id: "vmSkillAbilities",
      indexDataSource: new DocumentListItemOrderDataSource({
        document: thiz.document,
        listName: "abilities",
      }),
      listItemViewModels: this.abilities,
      listItemTemplate: thiz.oneColumn === true ? TEMPLATES.SKILL_ABILITY_CHAT_MESSAGE : TEMPLATES.SKILL_ABILITY_LIST_ITEM,
      vmBtnAddItem: factory.createVmBtnAdd({
        parent: thiz,
        id: "vmBtnAdd",
        target: thiz.document,
        creationType: "skill-ability",
        withDialog: false,
        localizableLabel: "ambersteel.character.skill.ability.add.label",
        localizableType: "ambersteel.character.skill.ability.singular",
        localizableDialogTitle: "ambersteel.character.skill.ability.add.query",
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
   * @private
   */
  async _toggleSkillAbilitiesInitiallyVisible() {
    this.skillAbilitiesInitiallyVisible = !this.skillAbilitiesInitiallyVisible;
  }
}
