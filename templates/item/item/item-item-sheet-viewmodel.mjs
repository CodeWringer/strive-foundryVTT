import ButtonSendToChatViewModel from "../../../module/components/button-send-to-chat/button-send-to-chat-viewmodel.mjs";
import ButtonTakeItemViewModel from "../../../module/components/button-take-item/button-take-item-viewmodel.mjs";
import InputNumberSpinnerViewModel from "../../../module/components/input-number-spinner/input-number-spinner-viewmodel.mjs";
import InputTextareaViewModel from "../../../module/components/input-textarea/input-textarea-viewmodel.mjs";
import InputTextFieldViewModel from "../../../module/components/input-textfield/input-textfield-viewmodel.mjs";
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
    this.contextTemplate = "item-item-sheet";
    const thiz = this;

    this.vmTfName = new InputTextFieldViewModel({
      id: "vmTfName",
      isEditable: thiz.isEditable,
      propertyOwner: thiz.item,
      propertyPath: "name",
      placeholder: "ambersteel.labels.name",
      contextTemplate: thiz.contextTemplate,
      parent: thiz,
    });
    this.vmBtnSendToChat = new ButtonSendToChatViewModel({
      id: "vmBtnSendToChat",
      target: thiz.item,
      parent: thiz,
    });
    this.vmBtnTakeItem = new ButtonTakeItemViewModel({
      id: "vmBtnTakeItem",
      target: thiz.item,
      contextType: "item-sheet"
    });
    this.vmNsQuantity = new InputNumberSpinnerViewModel({
      id: "vmNsQuantity",
      isEditable: thiz.isEditable,
      propertyOwner: thiz.item,
      propertyPath: "data.data.quantity",
      contextTemplate: thiz.contextTemplate,
      parent: thiz,
      min: 1,
    });
    this.vmNsMaxQuantity = new InputNumberSpinnerViewModel({
      id: "vmNsMaxQuantity",
      isEditable: thiz.isEditable,
      propertyOwner: thiz.item,
      propertyPath: "data.data.maxQuantity",
      contextTemplate: thiz.contextTemplate,
      parent: thiz,
      min: 1,
    });
    this.vmNsShapeWidth = new InputNumberSpinnerViewModel({
      id: "vmNsShapeWidth",
      isEditable: thiz.isEditable,
      propertyOwner: thiz.item,
      propertyPath: "data.data.shape.width",
      contextTemplate: thiz.contextTemplate,
      parent: thiz,
      min: 1,
    });
    this.vmNsShapeHeight = new InputNumberSpinnerViewModel({
      id: "vmNsShapeHeight",
      isEditable: thiz.isEditable,
      propertyOwner: thiz.item,
      propertyPath: "data.data.shape.height",
      contextTemplate: thiz.contextTemplate,
      parent: thiz,
      min: 1,
    });
    this.vmTaDescription = new InputTextareaViewModel({
      id: "vmTaDescription",
      isEditable: thiz.isEditable,
      propertyPath: "data.data.description",
      propertyOwner: thiz.item,
      contextTemplate: thiz.contextTemplate,
      parent: thiz,
      placeholder: "ambersteel.labels.description",
      allowResize: true,
    });
  }
}
