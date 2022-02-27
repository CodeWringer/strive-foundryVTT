import { TEMPLATES } from "../../../module/templatePreloader.mjs";
import SheetViewModel from "../../sheet-viewmodel.mjs";

export default class SkillListItemViewModel extends SheetViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.SKILL_LIST_ITEM; }

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
   * @param {Actor | undefined} actor If not undefined, this is the actor that owns the item. 
   */
  constructor(args = {}) {
    super(args);
  }
}
