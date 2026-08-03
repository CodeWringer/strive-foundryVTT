import { StringUtil } from "../../../../common/util/string-utility.mjs";
import BaseItemSheet from "../base/sheet/base-item-sheet.mjs";
import MutationItemSheetViewModel from "./mutation-item-sheet-viewmodel.mjs";

/**
 * @extends BaseItemSheet
 */
export default class MutationItemSheet extends BaseItemSheet {
  /** @override */
  get localizedDocumentType() {
    return StringUtil.getLoca("system.item.mutation.mutation");
  }

  /** @override */
  createViewModel(document, context) {
    return new MutationItemSheetViewModel({
      id: this.id,
      document: document,
      sheet: this,
      context: context,
    });
  }
}
