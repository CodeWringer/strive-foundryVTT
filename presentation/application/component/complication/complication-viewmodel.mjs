import { TEMPLATES } from "../../templates.mjs";
import ViewModel from "../../view-model/view-model.mjs";

export default class ComplicationViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.application.component.complication.complication; }

  /** @override */
  get clazz() { return ComplicationViewModel; }

  constructor(args = {}) {
    super(args);
  }
}
