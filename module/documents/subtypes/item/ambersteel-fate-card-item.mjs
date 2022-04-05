import AmbersteelBaseItem from "./ambersteel-base-item.mjs";
import { TEMPLATES } from "../../../templatePreloader.mjs";
import FateCardChatMessageViewModel from "../../../../templates/item/fate-card/fate-card-chat-message-viewmodel.mjs";

export default class AmbersteelFateCardItem extends AmbersteelBaseItem {
  /**
   * @param parent {Item} The owning Item. 
   */
  constructor(parent) {
    super(parent);
    
    this.parent.chatMessageTemplate = this.chatMessageTemplate;
    this.parent.getChatData = this.getChatData.bind(this);
  }

  /** @override */
  get defaultImg() { return "icons/svg/wing.svg"; }

  /**
   * Chat message template path. 
   * @type {String}
   */
  get chatMessageTemplate() { return TEMPLATES.FATE_CARD_CHAT_MESSAGE; }

  /** @override */
  async getChatData() {
    const chatData = super.getChatData();
    chatData.flavor = game.i18n.localize("ambersteel.labels.fateCard");
    
    return chatData;
  }

  /**
   * Returns an instance of a view model for use in a chat message. 
   * @returns {FateCardChatMessageViewModel}
   * @param {Object | undefined} overrides Optional. An object that allows overriding any of the view model properties. 
   * @param {String | undefined} overrides.id
   * @param {Boolean | undefined} overrides.isEditable
   * @param {Boolean | undefined} overrides.isSendable
   * @param {Boolean | undefined} overrides.isOwner
   * @param {Boolean | undefined} overrides.isGM
   * @param {Item | undefined} overrides.item
   * @override
   */
  getChatViewModel(overrides = {}) {
    const base = super.getChatViewModel();
    return new FateCardChatMessageViewModel({
      id: base.id,
      isEditable: base.isEditable,
      isSendable: base.isSendable,
      isOwner: base.isOwner,
      isGM: base.isGM,
      item: this.parent,
      ...overrides,
    });
  }
}
