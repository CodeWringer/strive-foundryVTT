import { ExtenderUtil } from "../../../../common/extender-util.mjs";
import BaseListItemViewModel from "../base/base-list-item-viewmodel.mjs";

/**
 * @property {TransientMomentumAction} document
 */
export default class MomentumActionListItemViewModel extends BaseListItemViewModel {
  
  /** @override */
  getExtenders() {
    return super.getExtenders().concat(ExtenderUtil.getExtenders(MomentumActionListItemViewModel));
  }

}
