import { ExtenderUtil } from "../../../../common/extender-util.mjs";
import ViewModel from "../../../view-model/view-model.mjs";

/**
 * @property {TransientTrait} document
 */
export default class TraitListItemViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.BASE_LIST_ITEM; }

  /** @override */
  getExtenders() {
    return super.getExtenders().concat(ExtenderUtil.getExtenders(TraitListItemViewModel));
  }
}
