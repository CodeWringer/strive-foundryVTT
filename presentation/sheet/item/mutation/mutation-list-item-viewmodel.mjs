import { getExtenders } from "../../../../common/extender-util.mjs";
import BaseListItemViewModel from "../base/base-list-item-viewmodel.mjs";

/**
 * @property {TransientMutation} document
 */
export default class MutationListItemViewModel extends BaseListItemViewModel {
  
  /** @override */
  getExtenders() {
    return super.getExtenders().concat(getExtenders(MutationListItemViewModel));
  }

}
