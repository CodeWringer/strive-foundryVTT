import { ValidationUtil } from "../../../../../common/util/validation-utility.mjs";
import InputTextFieldViewModel from "../../../../component/input-textfield/input-textfield-viewmodel.mjs";
import ViewModel from "../../../../view-model/view-model.mjs";

export default class ProjectComplicationListItemViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.PROJECT_COMPLICATION_LIST_ITEM; }

  /**
   * @param {Object} args 
   * @param {String} args.complication 
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["complication"]);

    this.complication = args.complication;

    this.vmComplication = new InputTextFieldViewModel({
      id: "vmComplication",
      parent: this,
      value: this.complication,
    });
  }
}
