import { StringUtil } from "../../../../common/util/string-utility.mjs";
import { BaseItemSheet } from "../base/sheet/base-item-sheet.mjs";
import InjuryItemSheetViewModel from "./injury-item-sheet-viewmodel.mjs";

/**
 * @property {InjuryItemSheetViewModel} viewModel
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
export default class InjuryItemSheet extends BaseItemSheet {
  /** @override */
  get localizedDocumentType() {
    return StringUtil.getLoca("system.item.injury.injury");
  }
  
  /** @override */
  createViewModel(document) {
    return new InjuryItemSheetViewModel({
      id: this.id,
      document: document,
      sheet: this,
    });
  }
}
