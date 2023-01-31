import TransientScar from "../../../../business/document/item/transient-scar.mjs";
import { validateOrThrow } from "../../../../business/util/validation-utility.mjs";
import InputNumberSpinnerViewModel from "../../../component/input-number-spinner/input-number-spinner-viewmodel.mjs";
import LazyRichTextViewModel from "../../../component/lazy-rich-text/lazy-rich-text-viewmodel.mjs";
import { TEMPLATES } from "../../../templatePreloader.mjs";
import ViewModel from "../../../view-model/view-model.mjs";

export default class ScarChatMessageViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.SCAR_CHAT_MESSAGE; }

  /** @override */
  get entityId() { return this.document.id; }

  /**
   * @type {Boolean}
   * @readonly
   */
  allowPickup = false;
  
  /**
   * @type {String}
   * @readonly
   */
  sourceType = undefined;
  
  /**
   * @type {String}
   * @readonly
   */
  sourceId = undefined;
  
  /**
   * An array of user IDs, which identify those users whose characters would be permitted to pick the item up. 
   * @type {Array<String>}
   * @readonly
   */
  allowPickupBy = [];

  /**
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * 
   * @param {TransientScar} args.document 
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["document"]);

    this.document = args.document;

    this.contextTemplate = args.contextTemplate ?? "scar-chat-message";

    this.vmLazyDescription = new LazyRichTextViewModel({
      id: "vmLazyDescription",
      parent: this,
      isEditable: this.isEditable,
      isSendable: this.isSendable,
      isOwner: this.isOwner,
      renderableContent: this.document.description,
    });
    this.vmNsLimit = new InputNumberSpinnerViewModel({
      id: "vmNsLimit",
      parent: this,
      isEditable: this.isEditable,
      isSendable: this.isSendable,
      isOwner: this.isOwner,
      propertyOwner: this.document,
      propertyPath: "limit",
      min: 0,
    });
  }
}
