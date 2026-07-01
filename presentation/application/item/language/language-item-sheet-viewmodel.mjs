import BaseSheetViewModel from "../../view-model/base-sheet-viewmodel.mjs";

export default class LanguageItemSheetViewModel extends BaseSheetViewModel {
  /** @override */
  static get TEMPLATE() { throw new Error("NotImplementedException"); }
  
  /** @override */
  get clazz() { return LanguageItemSheetViewModel; }

  constructor(args = {}) {
    super(args);
  }
}
