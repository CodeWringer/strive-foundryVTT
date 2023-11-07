import { ASSET_TAGS } from "../../../../business/tags/system-tags.mjs"
import { validateOrThrow } from "../../../../business/util/validation-utility.mjs"
import { TAKE_ITEM_CONTEXT_TYPES } from "../../../component/button-take-item/button-take-item-viewmodel.mjs"
import InputImageViewModel from "../../../component/input-image/input-image-viewmodel.mjs"
import InputNumberSpinnerViewModel from "../../../component/input-number-spinner/input-number-spinner-viewmodel.mjs"
import InputRichTextViewModel from "../../../component/input-rich-text/input-rich-text-viewmodel.mjs"
import InputTagsViewModel from "../../../component/input-tags/input-tags-viewmodel.mjs"
import { TEMPLATES } from "../../../templatePreloader.mjs"
import ViewModelFactory from "../../../view-model/view-model-factory.mjs"
import ViewModel from "../../../view-model/view-model.mjs"

export default class AssetItemSheetViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.ASSET_SHEET; }

  /** @override */
  get entityId() { return this.document.id; }

  /**
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * 
   * @param {TransientAsset} args.document 
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["document"]);

    this.document = args.document;
    this.contextTemplate = args.contextTemplate ?? "item-item-sheet";
    const thiz = this;
    const factory = new ViewModelFactory();

    this.vmImg = new InputImageViewModel({
      parent: thiz,
      id: "vmImg",
      value: thiz.document.img,
      onChange: (_, newValue) => {
        thiz.document.img = newValue;
      },
    });
    this.vmTfName = factory.createVmTextField({
      parent: thiz,
      id: "vmTfName",
      propertyOwner: thiz.document,
      propertyPath: "name",
      placeholder: "ambersteel.general.name",
    });
    this.vmBtnSendToChat = factory.createVmBtnSendToChat({
      parent: thiz,
      id: "vmBtnSendToChat",
      target: thiz.document,
      isEditable: thiz.isEditable || thiz.isGM,
    });
    this.vmBtnTakeItem = factory.createVmBtnTakeItem({
      parent: thiz,
      id: "vmBtnTakeItem",
      target: thiz.document,
      contextType: TAKE_ITEM_CONTEXT_TYPES.itemSheet
    });
    this.vmNsQuantity = new InputNumberSpinnerViewModel({
      parent: thiz,
      id: "vmNsQuantity",
      value: thiz.document.quantity,
      onChange: (_, newValue) => {
        thiz.document.quantity = newValue;
      },
      min: 1,
    });
    this.vmNsMaxQuantity = new InputNumberSpinnerViewModel({
      parent: thiz,
      id: "vmNsMaxQuantity",
      value: thiz.document.maxQuantity,
      onChange: (_, newValue) => {
        thiz.document.maxQuantity = newValue;
      },
      min: 1,
    });
    this.vmNsBulk = new InputNumberSpinnerViewModel({
      parent: thiz,
      id: "vmNsBulk",
      value: thiz.document.bulk,
      onChange: (_, newValue) => {
        thiz.document.bulk = newValue;
      },
      min: 0,
    });
    this.vmRtDescription = new InputRichTextViewModel({
      parent: thiz,
      id: "vmRtDescription",
      value: thiz.document.description,
      onChange: (_, newValue) => {
        thiz.document.description = newValue;
      },
    });
    this.vmTags = new InputTagsViewModel({
      id: "vmTags",
      parent: this,
      systemTags: ASSET_TAGS.asArray(),
      value: this.document.tags,
      onChange: (_, newValue) => {
        this.document.tags = newValue;
      },
    });
  }

  /** @override */
  _getChildUpdates() {
    const updates = super._getChildUpdates();

    updates.set(this.vmBtnSendToChat, {
      ...updates.get(this.vmBtnSendToChat),
      isEditable: this.isEditable || this.isGM,
    });

    return updates;
  }
}
