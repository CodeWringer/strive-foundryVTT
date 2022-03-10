import { TEMPLATES } from "../../../module/templatePreloader.mjs";
import { validateOrThrow } from "../../../module/utils/validation-utility.mjs";
import ChatMessageViewModel from "../../chat-message-viewmodel.mjs";

export default class ItemChatMessageViewModel extends ChatMessageViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.ITEM_CHAT_MESSAGE; }

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
   * @param {Boolean | undefined} isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} isOwner If true, the current user is the owner of the represented document. 
   * @param {Boolean | undefined} isGM If true, the current user is a GM. 
   * 
   * @param {Item} item
   * 
   * @param {String} sourceType
   * @param {String} sourceId
   * @param {Boolean | undefined} allowPickup
   * @param {Array<String> | undefined} allowPickupBy
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["sourceType", "sourceId"]);

    this.sourceType = args.sourceType;
    this.sourceId = args.sourceId;
    this.allowPickup = args.allowPickup ?? false;
    this.allowPickupBy = args.allowPickupBy ?? [];
  }
}
