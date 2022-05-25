import SheetViewModel from "../../../module/components/sheet-viewmodel.mjs";
import { TEMPLATES } from "../../../module/templatePreloader.mjs";
import { validateOrThrow } from "../../../module/utils/validation-utility.mjs";

export default class MutationListItemViewModel extends SheetViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.ITEM_LIST_ITEM; }

  /**
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * 
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * @param {Boolean | undefined} args.isGM If true, the current user is a GM. 
   * 
   * @param {Item} args.item
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["item"]);

    this.item = args.item;
    this.contextTemplate = args.contextTemplate ?? "item-list-item";
    const thiz = this;

    this.vmImg = this.createVmImg({
      id: "vmImg",
      propertyOwner: thiz.item,
      propertyPath: "img",
    });
    this.vmTfName = this.createVmTextField({
      id: "vmTfName",
      propertyOwner: thiz.item,
      propertyPath: "name",
      placeholder: "ambersteel.labels.name",
    });
    this.vmBtnSendToChat = this.createVmBtnSendToChat({
      id: "vmBtnSendToChat",
      target: thiz.item,
    });
    this.vmBtnTakeItem = this.createVmBtnTakeItem({
      id: "vmBtnTakeItem",
      target: thiz.item,
      contextType: "list-item"
    });
    this.vmBtnDelete = this.createVmBtnDelete({
      id: "vmBtnDelete",
      target: thiz.item,
      withDialog: true,
    })
    this.vmNsQuantity = this.createVmNumberSpinner({
      id: "vmNsQuantity",
      propertyOwner: thiz.item,
      propertyPath: "data.data.quantity",
      min: 1,
    });
    this.vmNsMaxQuantity = this.createVmNumberSpinner({
      id: "vmNsMaxQuantity",
      propertyOwner: thiz.item,
      propertyPath: "data.data.maxQuantity",
      min: 1,
    });
    this.vmNsShapeWidth = this.createVmNumberSpinner({
      id: "vmNsShapeWidth",
      propertyOwner: thiz.item,
      propertyPath: "data.data.shape.width",
      min: 1,
    });
    this.vmNsShapeHeight = this.createVmNumberSpinner({
      id: "vmNsShapeHeight",
      propertyOwner: thiz.item,
      propertyPath: "data.data.shape.height",
      min: 1,
    });
    this.vmRtDescription = this.createVmRichText({
      id: "vmRtDescription",
      propertyOwner: thiz.item,
      propertyPath: "data.data.description",
    });
  }
}
