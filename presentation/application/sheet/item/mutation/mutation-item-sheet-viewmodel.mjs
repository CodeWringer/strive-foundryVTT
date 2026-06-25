import { ExtenderUtil } from "../../../../common/util/extender-util.mjs";
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
