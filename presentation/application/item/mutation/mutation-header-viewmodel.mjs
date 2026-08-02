import { StringUtil } from "../../../../common/util/string-utility.mjs";
import InputImageViewModel from "../../component/input-image/input-image-viewmodel.mjs";
import InputTextFieldViewModel from "../../component/input-textfield/input-textfield-viewmodel.mjs";
import { TEMPLATES } from "../../templates.mjs";
import ViewModel, { ViewModelToolTipDefinition } from "../../view-model/view-model.mjs";
import MutationContentViewModel from "./mutation-content-viewmodel.mjs";

export default class MutationHeaderViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.application.item.mutation.header; }

  /** @override */
  get clazz() { return MutationHeaderViewModel; }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, the sheet is in edit mode. 
   * 
   * @param {TransientMutation} args.document The represented transient document instance. 
   * @param {ActorSheet | ItemSheet} args.sheet The parent sheet instance. 
   */
  constructor(args = {}) {
    super(args);

    this.vmImg = new InputImageViewModel({
      id: "vmImg",
      parent: this,
      value: this.document.img,
      onChange: (_, newValue) => {
        this.document.img = newValue;
      },
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
  }
}
