import { ExtenderUtil } from "../../../../common/extender-util.mjs";
import BaseItemSheetViewModel from "../base/base-item-sheet-viewmodel.mjs";

/**
 * @property {TransientTrait} document
 */
export default class TraitItemSheetViewModel extends BaseItemSheetViewModel {
  /** @override */
  getExtenders() {
    return super.getExtenders().concat(ExtenderUtil.getExtenders(TraitItemSheetViewModel));
  }
}
