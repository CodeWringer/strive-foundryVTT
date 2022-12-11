import { validateOrThrow } from "../../../../business/util/validation-utility.mjs";
import ViewModel from "../../../view-model/view-model.mjs";
import ViewModelFactory from "../../../view-model/view-model-factory.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";

export default class ItemChatMessageViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.ITEM_CHAT_MESSAGE; }

  /** @override */
  get entityId() { return this.item.id; }

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

  get description() { return TextEditor.enrichHTML(this.item.data.data.description); }

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
   * 
   * @param {String | undefined} args.sourceType
   * @param {String | undefined} args.sourceId
   * @param {Boolean | undefined} args.allowPickup
   * @param {Array<String> | undefined} args.allowPickupBy
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["item"]);

    this.item = args.item;
    this.sourceType = args.sourceType;
    this.sourceId = args.sourceId;
    this.allowPickup = args.allowPickup ?? false;
    this.allowPickupBy = args.allowPickupBy ?? [];

    this.contextTemplate = args.contextTemplate ?? "item-chat-message";
    const thiz = this;
    const factory = new ViewModelFactory();

    this.vmBtnTakeItem = factory.createVmBtnTakeItem({
      parent: thiz,
      id: "vmBtnTakeItem",
      target: thiz.item,
      contextType: "chat-message"
    });
  }
}
