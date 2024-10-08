import { ValidationUtil } from "../../../../business/util/validation-utility.mjs";
import ButtonTakeItemViewModel, { TAKE_ITEM_CONTEXT_TYPES } from "../../../component/button-take-item/button-take-item-viewmodel.mjs"
import InputTagsViewModel from "../../../component/input-tags/input-tags-viewmodel.mjs"
import LazyRichTextViewModel from "../../../component/lazy-rich-text/lazy-rich-text-viewmodel.mjs"
import ViewModel from "../../../view-model/view-model.mjs"

export default class AssetChatMessageViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.ASSET_CHAT_MESSAGE; }

  /** @override */
  get entityId() { return this.document.id; }

  /**
   * @type {Boolean}
   * @readonly
   */
  get hasTags() { return this.document.tags.length > 0; }

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
   * @param {TransientAsset} args.document 
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * 
   * @param {String | undefined} args.sourceType
   * @param {String | undefined} args.sourceId
   * @param {Boolean | undefined} args.allowPickup
   * @param {Array<String> | undefined} args.allowPickupBy
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["document"]);

    this.document = args.document;
    this.sourceType = args.sourceType;
    this.sourceId = args.sourceId;
    this.allowPickup = args.allowPickup ?? false;
    this.allowPickupBy = args.allowPickupBy ?? [];

    this.contextTemplate = args.contextTemplate ?? "item-chat-message";
    const thiz = this;

    this.vmBtnTakeItem = new ButtonTakeItemViewModel({
      parent: thiz,
      id: "vmBtnTakeItem",
      target: thiz.document,
      contextType: TAKE_ITEM_CONTEXT_TYPES.chatMessage
    });
    this.vmLazyDescription = new LazyRichTextViewModel({
      id: "vmLazyDescription",
      parent: this,
      isEditable: this.isEditable,
      isSendable: this.isSendable,
      isOwner: this.isOwner,
      renderableContent: this.document.description,
    });
    this.vmTags = new InputTagsViewModel({
      id: "vmTags",
      parent: this,
      value: this.document.tags,
      onChange: (_, newValue) => {
        this.document.tags = newValue;
      },
      isEditable: false,
    });
  }
}
