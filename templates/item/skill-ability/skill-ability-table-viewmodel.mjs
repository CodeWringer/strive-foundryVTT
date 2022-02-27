import { TEMPLATES } from "../../../module/templatePreloader.mjs";
import SheetViewModel from "../../sheet-viewmodel.mjs";
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
  skillAbilitiesInitiallyVisible = false
  
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
   * @param {Boolean} isEditable If true, the sheet is editable. 
   * @param {Boolean} isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean} isOwner If true, the current user is the owner of the represented document. 
   * @param {Boolean} isGM If true, the current user is a GM. 
   * 
   * @param {Item} item
   * @param {Boolean} oneColumn
   * @param {String} visGroupId
   * @param {Actor | undefined} actor
   * @param {Boolean | undefined} skillAbilitiesInitiallyVisible
   */
  constructor(args = {}) {
    super(args);

    // Own properties.
    this.item = args.item;
    this.oneColumn = args.oneColumn;
    this.visGroupId = args.visGroupId;
    this.actor = args.actor;
    this.skillAbilitiesInitiallyVisible = args.skillAbilitiesInitiallyVisible ?? false;

    // Child view models. 
    const thiz = this;

    for (let i = 0; i < this.item.data.data.abilities.length; i++) {
      const skillAbility = this.item.data.data.abilities[i];

      const vm = new SkillAbilityListItemViewModel({ 
        ...args, 
        id: `ability[${i}]`, 
        skillAbility: skillAbility, 
        parent: thiz,
        index: i,
      });
      this.abilities.push(vm);
    }
  }
}
