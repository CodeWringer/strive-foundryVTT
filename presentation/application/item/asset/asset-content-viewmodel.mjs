import { StringUtil } from "../../../../common/util/string-utility.mjs";
import InputNumberSpinnerViewModel from "../../component/input-number-spinner/input-number-spinner-viewmodel.mjs";
import InputRichTextViewModel from "../../component/input-rich-text/input-rich-text-viewmodel.mjs";
import { TEMPLATES } from "../../templates.mjs";
import ViewModel, { ViewModelToolTipDefinition } from "../../view-model/view-model.mjs";
import BaseItemContentViewModel from "../base/base-item-content-viewmodel.mjs";

export default class AssetContentViewModel extends BaseItemContentViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.application.item.asset.content; }

  /** @override */
  get clazz() { return AssetContentViewModel; }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * 
   * @param {TransientAsset} args.document The represented transient document instance. 
   * @param {ActorSheet | ItemSheet} args.sheet The parent sheet instance. 
   * @param {DOCUMENT_CONTEXT | undefined} args.context Indicates whether this is an embedded or 
   * independent document. This affects interactibility. 
   * * default `DOCUMENT_CONTEXT.independent`
   */
  constructor(args = {}) {
    super(args);

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
    this.vmBulk = new InputNumberSpinnerViewModel({
      id: "vmBulk",
      parent: this,
      isEditable: this.isEditable,
      value: this.document.bulk,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.item.asset.bulk"),
      }),
      onChange: (_, newValue) => {
        this.document.bulk = newValue;
      },
    });
    this.vmQuality = new InputNumberSpinnerViewModel({
      id: "vmQuality",
      parent: this,
      isEditable: this.isEditable,
      value: this.document.quality,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.item.asset.quality"),
      }),
      onChange: (_, newValue) => {
        this.document.quality = newValue;
      },
    });
  }
}
