import { TEMPLATES } from "../../../module/templatePreloader.mjs";
import InjuryViewModel from "./injury-viewmodel.mjs";

export default class InjuryListItemViewModel extends InjuryViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.INJURY_LIST_ITEM; }

  get stateOptions() { return game.ambersteel.getInjuryOptions(); }

  /**
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * 
   * @param {Boolean | undefined} isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} isOwner If true, the current user is the owner of the represented document. 
   * @param {Boolean | undefined} isGM If true, the current user is a GM. 
   * 
   * @param {Item} item
   */
  constructor(args = {}) {
    super(args);
  }
}
