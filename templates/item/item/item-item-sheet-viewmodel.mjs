import SheetViewModel from "../../../module/components/sheet-viewmodel.mjs";
import { TEMPLATES } from "../../../module/templatePreloader.mjs";
import { validateOrThrow } from "../../../module/utils/validation-utility.mjs";

export default class ItemItemSheetViewModel extends SheetViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.ITEM_SHEET; }

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
    this.contextTemplate = args.contextTemplate ?? "item-item-sheet";
    const thiz = this;

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
      contextType: "item-sheet"
    });
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
    this.vmTaDescription = this.createVmTextArea({
      id: "vmTaDescription",
      propertyPath: "data.data.description",
      propertyOwner: thiz.item,
      placeholder: "ambersteel.labels.description",
      allowResize: true,
    });
  }
}
