import ButtonAddViewModel from "../../../module/components/button-add/button-add-viewmodel.mjs";
import ButtonToggleVisibilityViewModel from "../../../module/components/button-toggle-visibility/button-toggle-visibility-viewmodel.mjs";
import SheetViewModel from "../../../module/components/sheet-viewmodel.mjs";
import { TEMPLATES } from "../../../module/templatePreloader.mjs";
import { createUUID } from "../../../module/utils/uuid-utility.mjs";
import { validateOrThrow } from "../../../module/utils/validation-utility.mjs";
import SkillAbilityListItemViewModel from "./skill-ability-list-item-viewmodel.mjs";

export default class SkillAbilityTableViewModel extends SheetViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.SKILL_ABILITY_TABLE; }

  /**
   * @type {Item}
   * @readonly
   */
  item = undefined;
  
  /**
   * @type {Boolean}
   * @readonly
   */
  _skillAbilitiesInitiallyVisible = false
  get skillAbilitiesInitiallyVisible() { return this._skillAbilitiesInitiallyVisible; }
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
  get attackTypeOptions() { return game.ambersteel.getAttackTypeOptions(); }

  /**
   * @type {Array<ChoiceOption>}
   * @readonly
   */
  get damageTypeOptions() { return game.ambersteel.getDamageTypeOptions(); }

  /**
   * @type {Array<SkillAbilityListItemViewModel>}
   * @readonly
   */
  abilities = [];
  
  /**
   * @type {Actor | undefined}
   * @readonly
   */
  actor = undefined;

  /**
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * 
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * @param {Boolean | undefined} args.isGM If true, the current user is a GM. 
   * 
   * @param {Item} args.item
   * @param {Boolean | undefined} args.oneColumn
   * @param {String | undefined} args.visGroupId
   * @param {Actor | undefined} args.actor
   * @param {Boolean | undefined} args.skillAbilitiesInitiallyVisible
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["item"]);

    this.registerViewStateProperty("_skillAbilitiesInitiallyVisible");

    // Own properties.
    this.item = args.item;
    this.oneColumn = args.oneColumn ?? false;
    this.visGroupId = args.visGroupId ?? createUUID();
    this.actor = args.actor;
    this._skillAbilitiesInitiallyVisible = args.skillAbilitiesInitiallyVisible ?? false;

    // Child view models. 
    this.contextTemplate = "skill-ability-table";
    const thiz = this;

    for (let i = 0; i < this.item.data.data.abilities.length; i++) {
      const skillAbility = this.item.data.data.abilities[i];

      const vm = new SkillAbilityListItemViewModel({
        id: `vmSkillAbility-${i}`, 
        isEditable: args.isEditable,
        isSendable: args.isSendable,
        isOwner: args.isOwner,
        isGM: args.isGM,
        skillAbility: skillAbility, 
        parent: thiz,
        item: thiz.item,
        actor: thiz.actor,
        index: i,
      });
      this.abilities.push(vm);
      this[vm.id] = vm;
    }

    this.vmBtnToggleVisibilityExpand = new ButtonToggleVisibilityViewModel({
      id: "vmBtnToggleVisibilityExpand",
      target: thiz.item,
      parent: thiz,
      visGroup: thiz.visGroupId,
      toggleSelf: true,
      callback: thiz._toggleSkillAbilitiesInitiallyVisible.bind(thiz),
    });
    this.vmBtnToggleVisibilityCollapse = new ButtonToggleVisibilityViewModel({
      id: "vmBtnToggleVisibilityCollapse",
      target: thiz.item,
      parent: thiz,
      visGroup: thiz.visGroupId,
      toggleSelf: true,
      callback: thiz._toggleSkillAbilitiesInitiallyVisible.bind(thiz),
    });

    if (this.isEditable !== true) return;

    this.vmBtnAdd = new ButtonAddViewModel({
      id: "vmBtnAdd",
      target: thiz.item,
      parent: thiz,
      creationType: "skill-ability",
      withDialog: false,
    });
  }

  /**
   * @private
   */
  async _toggleSkillAbilitiesInitiallyVisible() {
    this.skillAbilitiesInitiallyVisible = !this.skillAbilitiesInitiallyVisible;
  }
}
