import AmbersteelBaseItem from "./ambersteel-base-item.mjs";
import { TEMPLATES } from "../../../templatePreloader.mjs";
import ItemChatMessageViewModel from "../../../../templates/item/item/item-chat-message-viewmodel.mjs";

export default class AmbersteelItemItem extends AmbersteelBaseItem {
  /**
   * @param parent {Item} The owning Item. 
   */
  constructor(parent) {
    super(parent);
    
    this.parent.chatMessageTemplate = this.chatMessageTemplate;
    this.parent.getChatData = this.getChatData.bind(this);
  }
  
  /** @override */
  get defaultImg() { return "icons/svg/item-bag.svg"; }
  
  /**
   * Chat message template path. 
   * @type {String}
   */
  get chatMessageTemplate() { return TEMPLATES.ITEM_CHAT_MESSAGE; }
  
  /** @override */
  prepareData(context) {
    // Ensure number data type. 
    context.data.data.shape.width = parseInt(context.data.data.shape.width);
    context.data.data.shape.height = parseInt(context.data.data.shape.height);
  }
  
  prepareDerivedData() {
    // Derive bulk from shape. 
    const shape = this.parent.data.data.shape;
    if (shape === undefined) {
      game.ambersteel.logger.logWarn("Shape on item undefined! Using fallback '{ width: 1, height: 1 }'");
      shape = { width: 1, height: 1 };
    }
    this.parent.data.data.bulk = shape.width * shape.height;
  }

  /** @override */
  async getChatData() {
    const chatData = super.getChatData();
    chatData.flavor = game.i18n.localize("ambersteel.labels.item");
    
    return chatData;
  }

  /**
   * Returns an instance of a view model for use in a chat message. 
   * @returns {ItemChatMessageViewModel}
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
   * @override
   */
  getChatViewModel(overrides = {}) {
    const base = super.getChatViewModel();
    return new ItemChatMessageViewModel({
      id: base.id,
      isEditable: base.isEditable,
      isSendable: base.isSendable,
      isOwner: base.isOwner,
      isGM: base.isGM,
      item: this.parent,
      actor: this.parent.parent,
      sourceType: undefined,
      sourceId: undefined,
      allowPickup: false, // TODO: The user must be able to select who gets to pick this item up. 
      allowPickupBy: [], // TODO: The user must be able to select who gets to pick this item up. 
      ...overrides,
    });
  }
}
