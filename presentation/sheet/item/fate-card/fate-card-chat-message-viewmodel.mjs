import { validateOrThrow } from "../../../../business/util/validation-utility.mjs";
import { TEMPLATES } from "../../../templatePreloader.mjs";
import ViewModelFactory from "../../../view-model/view-model-factory.mjs";
import ViewModel from "../../../view-model/view-model.mjs";

export default class FateCardChatMessageViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.FATE_CARD_CHAT_MESSAGE; }

  /** @override */
  get entityId() { return this.document.id; }

  get description() { return TextEditor.enrichHTML(this.document.description); }

  /**
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * 
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * 
   * @param {TransientFateCard} args.document
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["document"]);

    this.document = args.document;
    this.contextTemplate = args.contextTemplate ?? "fate-card-chat-message";

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
    });
  }
}
