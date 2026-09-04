import { StringUtil } from "../../../../common/util/string-utility.mjs";
import { DOCUMENT_CONTEXT } from "../../../model/document-context.mjs";
import InputSplitNumberSpinnerViewModel from "../../component/input-split-number-spinner/input-split-number-spinner-viewmodel.mjs";
import { TEMPLATES } from "../../templates.mjs";
import ViewModel, { ViewModelToolTipDefinition } from "../../view-model/view-model.mjs";
import BaseItemHeaderViewModel from "../base/base-item-header-viewmodel.mjs";

export default class HealthConditionHeaderViewModel extends BaseItemHeaderViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.application.item.healthCondition.header; }

  /** @override */
  get clazz() { return HealthConditionHeaderViewModel; }

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
   * @param {DOCUMENT_CONTEXT | undefined} args.context 
   * * default `DOCUMENT_CONTEXT.independent`
   */
  constructor(args = {}) {
    super(args);

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
        allowEditing: this.context === DOCUMENT_CONTEXT.embedded,
      },
      maximum: {
        value: this.document.maximum,
        min: 0,
      },
      onChange: (newValue) => {
        this.document.current = newValue.current;
        this.document.maximum = newValue.maximum > 0 ? newValue.maximum : null;
      },
    });
  }
}
