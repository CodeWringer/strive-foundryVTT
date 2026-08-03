import { StringUtil } from "../../../../common/util/string-utility.mjs";
import BaseItemSheet from "../base/sheet/base-item-sheet.mjs";
import TraitItemSheetViewModel from "./trait-item-sheet-viewmodel.mjs";

export default class TraitItemSheet extends BaseItemSheet {
  /** @override */
  get localizedDocumentType() {
    return StringUtil.getLoca("system.item.trait.trait");
  }
  
  /** @override */
  createViewModel(document, context) {
    return new TraitItemSheetViewModel({
      id: this.id,
      document: document,
      sheet: this,
      context: context,
    });
  }
}
