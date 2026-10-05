import { StringUtil } from "../../../../common/util/string-utility.mjs";
import BaseItemSheet from "../base/sheet/base-item-sheet.mjs";
import ExpertiseItemSheetViewModel from "./expertise-item-sheet-viewmodel.mjs";

export default class ExpertiseItemSheet extends BaseItemSheet {
  /** @override */
  get localizedDocumentType() {
    return StringUtil.getLoca("system.item.expertise.expertise");
  }
  
  /** @override */
  createViewModel(document, context) {
    return new ExpertiseItemSheetViewModel({
      id: this.id,
      document: document,
      sheet: this,
      context: context,
    });
  }
}
