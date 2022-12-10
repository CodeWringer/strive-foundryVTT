import { validateOrThrow } from "../../../../business/util/validation-utility.mjs";
import SheetViewModel from "../../../view-model/sheet-view-model.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";

export default class FateCardItemSheetViewModel extends SheetViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.FATE_CARD_ITEM_SHEET; }

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
    this.contextTemplate = args.contextTemplate ?? "fate-card-item-sheet";

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
      placeholder: "ambersteel.general.name",
    });
    this.vmBtnSendToChat = this.createVmBtnSendToChat({
      id: "vmBtnSendToChat",
      target: thiz.item,
      isEditable: thiz.isEditable || thiz.isGM,
    });
    this.vmNsMifp = this.createVmNumberSpinner({
      id: "vmNsMifp",
      propertyOwner: thiz.item,
      propertyPath: "data.data.cost.miFP",
      min: 0,
    });
    this.vmNsMafp = this.createVmNumberSpinner({
      id: "vmNsMafp",
      propertyOwner: thiz.item,
      propertyPath: "data.data.cost.maFP",
      min: 0,
    });
    this.vmNsAfp = this.createVmNumberSpinner({
      id: "vmNsAfp",
      propertyOwner: thiz.item,
      propertyPath: "data.data.cost.AFP",
      min: 0,
    });
    this.vmRtDescription = this.createVmRichText({
      id: "vmRtDescription",
      propertyOwner: thiz.item,
      propertyPath: "data.data.description",
    });
  }
}
