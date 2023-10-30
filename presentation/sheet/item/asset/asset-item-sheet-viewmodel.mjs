import { ASSET_TAGS } from "../../../../business/tags/system-tags.mjs"
import { validateOrThrow } from "../../../../business/util/validation-utility.mjs"
import { TAKE_ITEM_CONTEXT_TYPES } from "../../../component/button-take-item/button-take-item-viewmodel.mjs"
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

    this.vmImg = factory.createVmImg({
      parent: thiz,
      id: "vmImg",
      propertyOwner: thiz.document,
      propertyPath: "img",
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
    this.vmNsQuantity = factory.createVmNumberSpinner({
      parent: thiz,
      id: "vmNsQuantity",
      propertyOwner: thiz.document,
      propertyPath: "quantity",
      min: 1,
    });
    this.vmNsMaxQuantity = factory.createVmNumberSpinner({
      parent: thiz,
      id: "vmNsMaxQuantity",
      propertyOwner: thiz.document,
      propertyPath: "maxQuantity",
      min: 1,
    });
    this.vmNsBulk = factory.createVmNumberSpinner({
      parent: thiz,
      id: "vmNsBulk",
      propertyOwner: thiz.document,
      propertyPath: "bulk",
      min: 0,
    });
    this.vmRtDescription = factory.createVmRichText({
      parent: thiz,
      id: "vmRtDescription",
      propertyOwner: thiz.document,
      propertyPath: "description",
    });
    this.vmTags = new InputTagsViewModel({
      id: "vmTags",
      parent: this,
      propertyPath: "tags",
      propertyOwner: this.document,
      isEditable: this.isEditable,
      systemTags: ASSET_TAGS.asArray(),
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
