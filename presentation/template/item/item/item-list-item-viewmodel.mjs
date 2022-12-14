import { validateOrThrow } from "../../../../business/util/validation-utility.mjs";
import ViewModel from "../../../view-model/view-model.mjs";
import ViewModelFactory from "../../../view-model/view-model-factory.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";

export default class ItemListItemViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.ITEM_LIST_ITEM; }

  /** @override */
  get entityId() { return this.item.id; }

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
    const factory = new ViewModelFactory();

    this.vmImg = factory.createVmImg({
      parent: thiz,
      id: "vmImg",
      propertyOwner: thiz.item,
      propertyPath: "img",
    });
    this.vmTfName = factory.createVmTextField({
      parent: thiz,
      id: "vmTfName",
      propertyOwner: thiz.item,
      propertyPath: "name",
      placeholder: "ambersteel.general.name",
    });
    this.vmBtnSendToChat = factory.createVmBtnSendToChat({
      parent: thiz,
      id: "vmBtnSendToChat",
      target: thiz.item,
    });
    this.vmBtnTakeItem = factory.createVmBtnTakeItem({
      parent: thiz,
      id: "vmBtnTakeItem",
      target: thiz.item,
      contextType: "list-item"
    });
    this.vmBtnDelete = factory.createVmBtnDelete({
      parent: thiz,
      id: "vmBtnDelete",
      target: thiz.item,
      withDialog: true,
    })
    this.vmNsQuantity = factory.createVmNumberSpinner({
      parent: thiz,
      id: "vmNsQuantity",
      propertyOwner: thiz.item,
      propertyPath: "data.data.quantity",
      min: 1,
    });
    this.vmNsMaxQuantity = factory.createVmNumberSpinner({
      parent: thiz,
      id: "vmNsMaxQuantity",
      propertyOwner: thiz.item,
      propertyPath: "data.data.maxQuantity",
      min: 1,
    });
    this.vmNsShapeWidth = factory.createVmNumberSpinner({
      parent: thiz,
      id: "vmNsShapeWidth",
      propertyOwner: thiz.item,
      propertyPath: "data.data.shape.width",
      min: 1,
    });
    this.vmNsShapeHeight = factory.createVmNumberSpinner({
      parent: thiz,
      id: "vmNsShapeHeight",
      propertyOwner: thiz.item,
      propertyPath: "data.data.shape.height",
      min: 1,
    });
    this.vmRtDescription = factory.createVmRichText({
      parent: thiz,
      id: "vmRtDescription",
      propertyOwner: thiz.item,
      propertyPath: "data.data.description",
    });
  }
}