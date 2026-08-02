import BaseItemSheetViewModel from "../base/sheet/base-item-sheet-viewmodel.mjs";
import IllnessContentViewModel from "./illness-content-viewmodel.mjs";
import IllnessHeaderViewModel from "./illness-header-viewmodel.mjs";

export default class IllnessItemSheetViewModel extends BaseItemSheetViewModel {
  /** @override */
  get clazz() { return IllnessItemSheetViewModel; }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, the sheet is in edit mode. 
   * 
   * @param {TransientIllness} args.document The represented transient document instance. 
   * @param {ActorSheet | ItemSheet} args.sheet The parent sheet instance. 
   */
  constructor(args = {}) {
    super({
      ...args,
      contentViewModel: new IllnessContentViewModel({
        id: "vmContent",
        isEditable: args.isEditable,
        document: args.document,
        sheet: args.sheet,
      }),
      headerViewModel: new IllnessHeaderViewModel({
        id: "vmHeader",
        isEditable: args.isEditable,
        document: args.document,
        sheet: args.sheet,
      }),
    });
  }
}
