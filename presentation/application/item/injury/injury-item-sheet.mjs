import { StringUtil } from "../../../../common/util/string-utility.mjs";
import BaseItemSheet from "../base/sheet/base-item-sheet.mjs";
import InjuryItemSheetViewModel from "./injury-item-sheet-viewmodel.mjs";

/**
 * @extends BaseItemSheet
 */
export default class InjuryItemSheet extends BaseItemSheet {
  /** @override */
  get localizedDocumentType() {
    return StringUtil.getLoca("system.item.injury.injury");
  }
  
  /** @override */
  createViewModel(document, context) {
    return new InjuryItemSheetViewModel({
      id: this.id,
      document: document,
      sheet: this,
      context: context,
    });
  }
}
