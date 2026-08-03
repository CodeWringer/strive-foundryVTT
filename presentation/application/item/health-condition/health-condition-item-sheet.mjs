import { StringUtil } from "../../../../common/util/string-utility.mjs";
import BaseItemSheet from "../base/sheet/base-item-sheet.mjs";
import HealthConditionItemSheetViewModel from "./health-condition-item-sheet-viewmodel.mjs";

/**
 * @extends BaseItemSheet
 */
export default class HealthConditionItemSheet extends BaseItemSheet {
  /** @override */
  get localizedDocumentType() {
    return StringUtil.getLoca("system.item.healthCondition.healthCondition");
  }

  /** @override */
  createViewModel(document, context) {
    return new HealthConditionItemSheetViewModel({
      id: this.id,
      document: document,
      sheet: this,
      context: context,
    });
  }
}
