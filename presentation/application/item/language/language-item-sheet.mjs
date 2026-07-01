import { StringUtil } from "../../../../common/util/string-utility.mjs";
import { TEMPLATES } from "../../templates.mjs";
import { BaseItemSheet } from "../base/sheet/base-item-sheet.mjs";
import LanguageItemSheetViewModel from "./language-item-sheet-viewmodel.mjs";

/**
 * @property {ViewModel} viewModel
 * @property {HTMLElement} html The form element of the sheet. 
 * * Read-only
 * @property {HTMLElement} content The content element of the sheet. 
 * * Read-only
 * @property {Boolean} isEditMode
 * 
 * @extends BaseItemSheet
 */
export class LanguageItemSheet extends BaseItemSheet {
  /** @override */
  get localizedDocumentType() {
    return StringUtil.getLoca("system.item.language.language");
  }

  /** @override */
  static PARTS = {
    form: {
      template: TEMPLATES.application.item.language.sheet,
    },
  }

  /** @override */
  createViewModel(document) {
    return new LanguageItemSheetViewModel({
      id: this.id,
      document: document,
      sheet: this,
      isOwner: this.isOwner,
      isEditable: this.isOwner,
      isSendable: this.isOwner,
    });
  }
}
