import { TEMPLATES } from "../../templates.mjs";
import BaseItemHeaderViewModel from "../base/base-item-header-viewmodel.mjs";

export default class MutationHeaderViewModel extends BaseItemHeaderViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.application.item.mutation.header; }

  /** @override */
  get clazz() { return MutationHeaderViewModel; }
}
