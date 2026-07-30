import { StringUtil } from "../../../../common/util/string-utility.mjs";
import BaseItemSheet from "../base/sheet/base-item-sheet.mjs";
import MutationItemSheetViewModel from "./mutation-item-sheet-viewmodel.mjs";

/**
 * @property {MutationItemSheetViewModel} viewModel
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
export default class MutationItemSheet extends BaseItemSheet {
  /** @override */
  get localizedDocumentType() {
    return StringUtil.getLoca("system.item.mutation.mutation");
  }

  /** @override */
  createViewModel(document) {
    return new MutationItemSheetViewModel({
      id: this.id,
      document: document,
      sheet: this,
    });
  }
}
