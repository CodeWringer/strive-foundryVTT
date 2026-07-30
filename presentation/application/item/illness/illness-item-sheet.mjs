import { StringUtil } from "../../../../common/util/string-utility.mjs";
import BaseItemSheet from "../base/sheet/base-item-sheet.mjs";
import IllnessItemSheetViewModel from "./illness-item-sheet-viewmodel.mjs";

/**
 * @property {IllnessItemSheetViewModel} viewModel
 * @property {HTMLElement} html The form element of the sheet. 
 * * Read-only
 * @property {HTMLElement} content The content element of the sheet. 
 * * Read-only
 * @property {String} title
 * * Read-only
 * @property {String} localizedDocumentType
 * * Read-only
 * 
 * @extends BaseItemSheet
 */
export default class IllnessItemSheet extends BaseItemSheet {
  /** @override */
  get localizedDocumentType() {
    return StringUtil.getLoca("system.item.illness.illness");
  }
  
  /** @override */
  createViewModel(document) {
    return new IllnessItemSheetViewModel({
      id: this.id,
      document: document,
      sheet: this,
    });
  }
}
