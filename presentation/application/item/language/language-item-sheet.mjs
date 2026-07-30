import { StringUtil } from "../../../../common/util/string-utility.mjs";
import BaseItemSheet from "../base/sheet/base-item-sheet.mjs";
import LanguageItemSheetViewModel from "./language-item-sheet-viewmodel.mjs";

/**
 * @property {LanguageItemSheetViewModel} viewModel
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
export default class LanguageItemSheet extends BaseItemSheet {
  /** @override */
  get localizedDocumentType() {
    return StringUtil.getLoca("system.item.language.language");
  }

  /** @override */
  createViewModel(document) {
    return new LanguageItemSheetViewModel({
      id: this.id,
      document: document,
      sheet: this,
    });
  }
}
