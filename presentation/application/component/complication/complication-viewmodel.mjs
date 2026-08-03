import Complication from "../../../../business/model/domain/complication/complication.mjs";
import { StringUtil } from "../../../../common/util/string-utility.mjs";
import { TEMPLATES } from "../../templates.mjs";
import ViewModel, { ViewModelToolTipDefinition } from "../../view-model/view-model.mjs";
import InputRichTextViewModel from "../input-rich-text/input-rich-text-viewmodel.mjs";
import InputTextFieldViewModel from "../input-textfield/input-textfield-viewmodel.mjs";

export default class ComplicationViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.application.component.complication.complication; }

  /** @override */
  get clazz() { return ComplicationViewModel; }

  /**
   * @param {Object} args 
   * @param {Complication} args.document 
   */
  constructor(args = {}) {
    super(args);

    this.document = args.document;

    this.vmName = new InputTextFieldViewModel({
      id: "vmName",
      parent: this,
      isEditable: this.isEditable,
      value: this.document.name,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.general.name"),
      }),
      onChange: (_, newValue) => {
        this.document.name = newValue;
      }
    });
    this.vmDescription = new InputRichTextViewModel({
      id: "vmDescription",
      parent: this,
      isEditable: this.isEditable,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.general.description"),
      }),
      value: this.document.description,
      onChange: (_, newValue) => {
        this.document.description = newValue;
      },
    });
  }
}
