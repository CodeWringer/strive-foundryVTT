import { ExtenderUtil } from "../../../../common/extender-util.mjs";
import BaseItemSheetViewModel from "../base/base-item-sheet-viewmodel.mjs";

/**
 * @property {TransientMutation} document
 */
export default class MutationItemSheetViewModel extends BaseItemSheetViewModel {
  
  /** @override */
  getExtenders() {
    return super.getExtenders().concat(ExtenderUtil.getExtenders(MutationItemSheetViewModel));
  }

}
