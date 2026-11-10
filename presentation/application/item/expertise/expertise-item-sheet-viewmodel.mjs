import BaseItemSheetViewModel from "../base/sheet/base-item-sheet-viewmodel.mjs";
import ExpertiseContentViewModel from "./expertise-content-viewmodel.mjs";
import ExpertiseHeaderViewModel from "./expertise-header-viewmodel.mjs";

export default class ExpertiseItemSheetViewModel extends BaseItemSheetViewModel {
  /** @override */
  get clazz() { return ExpertiseItemSheetViewModel; }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, the sheet is in edit mode. 
   * 
   * @param {Expertise} args.document The represented transient document instance. 
   * @param {ActorSheet | ItemSheet} args.sheet The parent sheet instance. 
   */
  constructor(args = {}) {
    super({
      ...args,
      headerViewModel: new ExpertiseHeaderViewModel({
        id: "header",
        isEditable: args.isEditable,
        document: args.document,
        sheet: args.sheet,
      }),
      contentViewModel: new ExpertiseContentViewModel({
        id: "content",
        isEditable: args.isEditable,
        document: args.document,
        sheet: args.sheet,
      }),
    });
  }
}
