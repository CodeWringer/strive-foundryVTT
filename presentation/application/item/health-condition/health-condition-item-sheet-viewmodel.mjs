import BaseItemSheetViewModel from "../base/sheet/base-item-sheet-viewmodel.mjs";
import HealthConditionContentViewModel from "./health-condition-content-viewmodel.mjs";
import HealthConditionHeaderViewModel from "./health-condition-header-viewmodel.mjs";

export default class HealthConditionItemSheetViewModel extends BaseItemSheetViewModel {
  /** @override */
  get clazz() { return HealthConditionItemSheetViewModel; }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, the sheet is in edit mode. 
   * 
   * @param {TransientHealthCondition} args.document The represented transient document instance. 
   * @param {ActorSheet | ItemSheet} args.sheet The parent sheet instance. 
   */
  constructor(args = {}) {
    super({
      ...args,
      contentViewModel: new HealthConditionContentViewModel({
        id: "vmContent",
        isEditable: args.isEditable,
        document: args.document,
        sheet: args.sheet,
      }),
      headerViewModel: new HealthConditionHeaderViewModel({
        id: "vmHeader",
        isEditable: args.isEditable,
        document: args.document,
        sheet: args.sheet,
      }),
    });
  }
}
