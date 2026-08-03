import BaseItemSheetViewModel from "../base/sheet/base-item-sheet-viewmodel.mjs";
import TraitContentViewModel from "./trait-content-viewmodel.mjs";
import TraitHeaderViewModel from "./trait-header-viewmodel.mjs";

export default class TraitItemSheetViewModel extends BaseItemSheetViewModel {
  /** @override */
  get clazz() { return TraitItemSheetViewModel; }

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
   * @param {DOCUMENT_CONTEXT | undefined} args.context Indicates whether this is an embedded or 
   * independent document. This affects interactibility. 
   * * default `DOCUMENT_CONTEXT.independent`
   */
  constructor(args = {}) {
    super({
      ...args,
      headerViewModel: new TraitHeaderViewModel({
        id: "vmHeader",
        isEditable: args.isEditable,
        document: args.document,
        sheet: args.sheet,
      }),
      contentViewModel: new TraitContentViewModel({
        id: "vmContent",
        isEditable: args.isEditable,
        document: args.document,
        sheet: args.sheet,
      }),
    });
  }
}
