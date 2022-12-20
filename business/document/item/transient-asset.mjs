import { TEMPLATES } from "../../../presentation/template/templatePreloader.mjs";
import ItemChatMessageViewModel from "../../../presentation/template/item/item/item-chat-message-viewmodel.mjs";
import PreparedChatData from "../../../presentation/chat/prepared-chat-data.mjs";
import { SOUNDS_CONSTANTS } from "../../../presentation/audio/sounds.mjs";
import { ITEM_SUBTYPE } from "./item-subtype.mjs";
import TransientBaseItem from "./transient-base-item.mjs";

/**
 * Represents the full transient data of an asset. 
 * 
 * @extends TransientBaseItem
 * 
 * @property {Number} bulk
 */
export default class TransientAsset extends TransientBaseItem {
  /** @override */
  get defaultImg() { return "icons/svg/item-bag.svg"; }
  
  /** @override */
  get chatMessageTemplate() { return TEMPLATES.ITEM_CHAT_MESSAGE; }
  
  /**
   * @param {Item} document An encapsulated item instance. 
   * 
   * @throws {Error} Thrown, if `document` is `undefined`. 
   */
  constructor(document) {
    super(document);

    this.bulk = parseInt(context.data.data.shape.width) * parseInt(context.data.data.shape.height);
  }

  /** @override */
  prepareData(context) {
    super.prepareData(context);

    // Ensure number data type. 
    context.data.data.shape.width = parseInt(context.data.data.shape.width);
    context.data.data.shape.height = parseInt(context.data.data.shape.height);
  }

  /** @override */
  async getChatData() {
    const vm = this.getChatViewModel();

    const renderedContent = await renderTemplate(this.chatMessageTemplate, {
      viewModel: vm,
    });

    return new PreparedChatData({
      renderedContent: renderedContent,
      actor: this.owningDocument.document, 
      sound: SOUNDS_CONSTANTS.NOTIFY,
      viewModel: vm,
      flavor: game.i18n.localize("ambersteel.character.asset.singular"),
    });
  }

  /**
   * Returns an instance of a view model for use in a chat message. 
   * 
   * @param {Object | undefined} overrides Optional. An object that allows overriding any of the view model properties. 
   * @param {String | undefined} overrides.id
   * @param {Boolean | undefined} overrides.isEditable
   * @param {Boolean | undefined} overrides.isSendable
   * @param {Boolean | undefined} overrides.isOwner
   * @param {Boolean | undefined} overrides.isGM
   * @param {Item | undefined} overrides.item
   * @param {Actor | undefined} overrides.actor
   * @param {String | undefined} overrides.sourceType
   * @param {String | undefined} overrides.sourceId
   * @param {Boolean | undefined} overrides.allowPickup
   * @param {Array<String> | undefined} overrides.allowPickupBy
   * 
   * @returns {ItemChatMessageViewModel}
   * 
   * @override
   */
  getChatViewModel(overrides = {}) {
    return new ItemChatMessageViewModel({
      id: this.id,
      isEditable: this.isOwner,
      isSendable: this.isOwner || game.user.isGM,
      isOwner: this.isOwner,
      isGM: game.user.isGM,
      item: this.document,
      actor: this.owningDocument.document,
      sourceType: undefined,
      sourceId: undefined,
      allowPickup: false, // TODO #53: The user must be able to select who gets to pick this item up. 
      allowPickupBy: [], // TODO #53: The user must be able to select who gets to pick this item up. 
      ...overrides,
    });
  }
}

ITEM_SUBTYPE.set("item", (document) => { return new TransientAsset(document) });
