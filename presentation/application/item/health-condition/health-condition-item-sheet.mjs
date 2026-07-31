import { StringUtil } from "../../../../common/util/string-utility.mjs";
import BaseItemSheet from "../base/sheet/base-item-sheet.mjs";
import HealthConditionItemSheetViewModel from "./health-condition-item-sheet-viewmodel.mjs";

/**
 * @property {HealthConditionItemSheetViewModel} viewModel
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
export default class HealthConditionItemSheet extends BaseItemSheet {
  /** @override */
  get localizedDocumentType() {
    return StringUtil.getLoca("system.item.healthCondition.healthCondition");
  }

  /** @override */
  createViewModel(document) {
    return new HealthConditionItemSheetViewModel({
      id: this.id,
      document: document,
      sheet: this,
    });
  }
}
