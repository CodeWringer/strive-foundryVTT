import { StringUtil } from "../../../../common/util/string-utility.mjs";
import BaseItemSheet from "../base/sheet/base-item-sheet.mjs";
import IllnessItemSheetViewModel from "./illness-item-sheet-viewmodel.mjs";

/**
 * @extends BaseItemSheet
 */
export default class IllnessItemSheet extends BaseItemSheet {
  /** @override */
  get localizedDocumentType() {
    return StringUtil.getLoca("system.item.illness.illness");
  }
  
  /** @override */
  createViewModel(document, context) {
    return new IllnessItemSheetViewModel({
      id: this.id,
      document: document,
      sheet: this,
      context: context,
    });
  }
}
