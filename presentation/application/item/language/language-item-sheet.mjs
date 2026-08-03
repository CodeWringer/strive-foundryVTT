import { StringUtil } from "../../../../common/util/string-utility.mjs";
import BaseItemSheet from "../base/sheet/base-item-sheet.mjs";
import LanguageItemSheetViewModel from "./language-item-sheet-viewmodel.mjs";

/**
 * @extends BaseItemSheet
 */
export default class LanguageItemSheet extends BaseItemSheet {
  /** @override */
  get localizedDocumentType() {
    return StringUtil.getLoca("system.item.language.language");
  }

  /** @override */
  createViewModel(document, context) {
    return new LanguageItemSheetViewModel({
      id: this.id,
      document: document,
      sheet: this,
      context: context,
    });
  }
}
