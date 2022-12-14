import { validateOrThrow } from "../../../../business/util/validation-utility.mjs";
import ViewModel from "../../../view-model/view-model.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";

export default class IllnessChatMessageViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.ILLNESS_CHAT_MESSAGE; }

  /** @override */
  get entityId() { return this.item.id; }

  /**
   * @type {Item}
   */
  item = undefined;

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
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["item"]);

    this.item = args.item;
    this.contextTemplate = args.contextTemplate ?? "illness-chat-message";
  }
}