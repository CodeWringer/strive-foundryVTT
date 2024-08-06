import { getExtenders } from "../../../../common/extender-util.mjs";
import BaseItemSheetViewModel from "../base/base-item-sheet-viewmodel.mjs";

/**
 * @property {TransientMutation} document
 */
export default class MutationItemSheetViewModel extends BaseItemSheetViewModel {
  
  /** @override */
  getExtenders() {
    return super.getExtenders().concat(getExtenders(MutationItemSheetViewModel));
  }

}
