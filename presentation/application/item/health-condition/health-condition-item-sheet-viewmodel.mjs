import { StringUtil } from "../../../../common/util/string-utility.mjs";
import InputSplitNumberSpinnerViewModel from "../../component/input-split-number-spinner/input-split-number-spinner-viewmodel.mjs";
import InputTextFieldViewModel from "../../component/input-textfield/input-textfield-viewmodel.mjs";
import { TEMPLATES } from "../../templates.mjs";
import { ViewModelToolTipDefinition } from "../../view-model/view-model.mjs";
import BaseItemSheetViewModel from "../base/sheet/base-item-sheet-viewmodel.mjs";
import HealthConditionContentViewModel from "./health-condition-content-viewmodel.mjs";

export default class HealthConditionItemSheetViewModel extends BaseItemSheetViewModel {
  /** @override */
  get clazz() { return HealthConditionItemSheetViewModel; }

  /** @override */
  get headerTemplate() { return TEMPLATES.application.item.healthCondition.header; }

  /** @override */
  get contentTemplate() { return TEMPLATES.application.item.healthCondition.content; }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, the sheet is in edit mode. 
   * 
   * @param {TransientHealthCondition} args.document The represented transient document instance. 
   * @param {ActorSheet | ItemSheet} args.sheet The parent sheet instance. 
   */
  constructor(args = {}) {
    super({
      ...args,
      contentViewModel: new HealthConditionContentViewModel({
        id: "vmContent",
        document: args.document,
      }),
    });

    this.vmName = new InputTextFieldViewModel({
      id: "vmName",
      parent: this,
      isEditable: this.isEditable,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.general.name.documentName"),
      }),
      value: this.document.name,
      onChange: (_, newValue) => {
        this.document.name = newValue;
      },
    });
    this.vmQuantity = new InputSplitNumberSpinnerViewModel({
      id: "vmQuantity",
      parent: this,
      isEditable: this.isEditable,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.item.healthCondition.quantity"),
      }),
      current: {
        value: this.document.current,
        min: 1,
      },
      maximum: {
        value: this.document.maximum,
        min: 0,
      },
      onChange: (_, newValue) => {
        this.document.current = newValue.current;
        this.document.maximum = newValue.maximum > 0 ? newValue.maximum : null;
      },
    });
  }
}
