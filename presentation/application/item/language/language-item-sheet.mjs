import { BaseItemSheet } from "../base/sheet/base-item-sheet.mjs";
import LanguageItemSheetViewModel from "./language-item-sheet-viewmodel.mjs";

/**
 * @property {viewModel} viewModel
 * 
 * @extends BaseItemSheet
 */
export class LanguageItemSheet extends BaseItemSheet {
  /** @override */
  get title() { return "Language"; } // TODO #761 loca

  /** @override */
  getViewModel(document) {
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
