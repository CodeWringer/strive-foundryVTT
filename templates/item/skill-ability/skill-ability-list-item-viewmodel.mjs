import { TEMPLATES } from "../../../module/templatePreloader.mjs";
import { validateOrThrow } from "../../../module/utils/validation-utility.mjs";
import SheetViewModel from "../../sheet-viewmodel.mjs";

export default class SkillAbilityListItemViewModel extends SheetViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.SKILL_ABILITY_LIST_ITEM; }

  /**
   * @type {Item}
   * @readonly
   */
  item = undefined;

  /**
   * @type {SkillAbility}
   * @readonly
   */
  skillAbility = undefined;

  /**
   * @type {Actor | undefined}
   * @readonly
   */
  actor = undefined;

  /**
   * @type {Number}
   * @readonly
   */
  index = -1;

  get attackTypeOptions() { return game.ambersteel.getAttackTypeOptions(); }
  get damageTypeOptions() { return game.ambersteel.getDamageTypeOptions(); }

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
   * @param {SkillAbility} args.skillAbility
   * @param {Actor | undefined} args.actor
   * @param {Number} args.index
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["item", "skillAbility", "index"]);

    // Own properties.
    this.item = args.item;
    this.skillAbility = args.skillAbility;
    this.actor = args.actor;
    this.index = args.index;
  }
}
