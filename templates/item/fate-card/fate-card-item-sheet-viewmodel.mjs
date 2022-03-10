import ButtonSendToChatViewModel from "../../../module/components/button-send-to-chat/button-send-to-chat-viewmodel.mjs";
import InputNumberSpinnerViewModel from "../../../module/components/input-number-spinner/input-number-spinner-viewmodel.mjs";
import InputTextareaViewModel from "../../../module/components/input-textarea/input-textarea-viewmodel.mjs";
import InputTextFieldViewModel from "../../../module/components/input-textfield/input-textfield-viewmodel.mjs";
import { TEMPLATES } from "../../../module/templatePreloader.mjs";
import { validateOrThrow } from "../../../module/utils/validation-utility.mjs";
import SheetViewModel from "../../sheet-viewmodel.mjs";

export default class FateCardItemSheetViewModel extends SheetViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.FATE_CARD_ITEM_SHEET; }

  /**
   * @type {InputTextFieldViewModel}
   * @readonly
   */
  vmTfName = undefined;
  get idTfName() { return "tf-name"; }
  
  /**
   * @type {ButtonSendToChatViewModel}
   * @readonly
   */
  vmBtnSendToChat = undefined;
  get idBtnSendToChat() { return "btn-send-to-chat"; }
  
  /**
   * @type {InputNumberSpinnerViewModel}
   * @readonly
   */
  vmNsMifp = undefined;
  get idNsMifp() { return "ns-mifp"; }
  
  /**
   * @type {InputNumberSpinnerViewModel}
   * @readonly
   */
  vmNsMafp = undefined;
  get idNsMafp() { return "ns-mafp"; }
  
  /**
   * @type {InputNumberSpinnerViewModel}
   * @readonly
   */
  vmNsAfp = undefined;
  get idNsAfp() { return "ns-afp"; }
  
  /**
   * @type {InputTextareaViewModel}
   * @readonly
   */
  vmTaDescription = undefined;
  get idTaDescription() { return "ta-description"; }

  /**
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * 
   * @param {Boolean | undefined} isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} isOwner If true, the current user is the owner of the represented document. 
   * @param {Boolean | undefined} isGM If true, the current user is a GM. 
   * 
   * @param {Item} item
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["item"]);

    this.item = args.item;
    this.contextTemplate = "fate-card-item-sheet";

    const thiz = this;

    this.vmTfName = new InputTextFieldViewModel({
      id: thiz.idTfName,
      isEditable: thiz.isEditable,
      propertyOwner: thiz.item,
      propertyPath: "name",
      placeholder: "ambersteel.labels.name",
      contextTemplate: thiz.contextTemplate,
      parent: thiz,
    });
    this.vmBtnSendToChat = new ButtonSendToChatViewModel({
      id: thiz.idBtnSendToChat,
      target: thiz.item,
      parent: thiz,
    });
    this.vmNsMifp = new InputNumberSpinnerViewModel({
      id: thiz.idNsMifp,
      isEditable: thiz.isEditable,
      propertyPath: "data.data.cost.miFP",
      propertyOwner: thiz.item,
      contextTemplate: thiz.contextTemplate,
      parent: thiz,
      min: 0,
    });
    this.vmNsMafp = new InputNumberSpinnerViewModel({
      id: thiz.idNsMafp,
      isEditable: thiz.isEditable,
      propertyPath: "data.data.cost.maFP",
      propertyOwner: thiz.item,
      contextTemplate: thiz.contextTemplate,
      parent: thiz,
      min: 0,
    });
    this.vmNsAfp = new InputNumberSpinnerViewModel({
      id: thiz.idNsAfp,
      isEditable: thiz.isEditable,
      propertyPath: "data.data.cost.AFP",
      propertyOwner: thiz.item,
      contextTemplate: thiz.contextTemplate,
      parent: thiz,
      min: 0,
    });
    this.vmTaDescription = new InputTextareaViewModel({
      id: thiz.idTaDescription,
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
