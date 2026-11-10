import { StringUtil } from "../../../../common/util/string-utility.mjs";
import BaseItemSheet from "../base/sheet/base-item-sheet.mjs";
import FateCardItemSheetViewModel from "./fate-card-item-sheet-viewmodel.mjs";

export default class FateCardItemSheet extends BaseItemSheet {
  /** @override */
  get localizedDocumentType() {
    return StringUtil.getLoca("system.item.fateCard.fateCard");
  }

  /** @override */
  createViewModel(document) {
    return new FateCardItemSheetViewModel({
      id: this.id,
      document: document,
      sheet: this,
    });
  }
}
