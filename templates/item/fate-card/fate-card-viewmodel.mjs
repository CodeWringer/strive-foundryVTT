import ButtonDeleteViewModel from "../../../module/components/button-delete/button-delete-viewmodel.mjs";
import ButtonSendToChatViewModel from "../../../module/components/button-send-to-chat/button-send-to-chat-viewmodel.mjs";
import InputTextareaViewModel from "../../../module/components/input-textarea/input-textarea-viewmodel.mjs";
import InputTextFieldViewModel from "../../../module/components/input-textfield/input-textfield-viewmodel.mjs";
import { TEMPLATES } from "../../../module/templatePreloader.mjs";
import { validateOrThrow } from "../../../module/utils/validation-utility.mjs";
import SheetViewModel from "../../sheet-viewmodel.mjs";

export default class FateCardViewModel extends SheetViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.FATE_CARD; }

  /**
   * @type {Item}
   */
  item = undefined;

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
   * @type {ButtonDeleteViewModel}
   * @readonly
   */
  vmBtnDelete = undefined;
  get idBtnDelete() { return "btn-delete"; }

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
    this.contextTemplate = "fate-card";

    const thiz = this;

    this.vmTfName = new InputTextFieldViewModel({
      id: thiz.idTfName,
      contextTemplate: thiz.contextTemplate,
      parent: thiz,
      isEditable: thiz.isEditable,
      propertyOwner: thiz.item,
      propertyPath: "name",
      placeholder: "ambersteel.labels.name",
    });
    this.vmBtnSendToChat = new ButtonSendToChatViewModel({
      id: thiz.idBtnSendToChat,
      contextTemplate: thiz.contextTemplate,
      parent: thiz,
      target: thiz.item,
    });
    this.vmBtnDelete = new ButtonDeleteViewModel({
      id: thiz.idBtnDelete,
      contextTemplate: thiz.contextTemplate,
      parent: thiz,
      target: thiz.item,
      withDialog: true,
    });
    this.vmTaDescription = new InputTextareaViewModel({
      id: thiz.idTaDescription,
      contextTemplate: thiz.contextTemplate,
      parent: thiz,
      isEditable: thiz.isEditable,
      propertyPath: "data.data.description",
      propertyOwner: thiz.item,
      placeholder: "ambersteel.labels.description",
      allowResize: true,
    });
  }
}
