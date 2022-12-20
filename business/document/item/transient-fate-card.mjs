import { TEMPLATES } from "../../../presentation/template/templatePreloader.mjs";
import FateCardChatMessageViewModel from "../../../presentation/template/item/fate-card/fate-card-chat-message-viewmodel.mjs";
import PreparedChatData from "../../../presentation/chat/prepared-chat-data.mjs";
import { SOUNDS_CONSTANTS } from "../../../presentation/audio/sounds.mjs";
import { ITEM_SUBTYPE } from "./item-subtype.mjs";
import TransientBaseItem from "./transient-base-item.mjs";

/**
 * Represents the full transient data of a fate card. 
 * 
 * @extends TransientBaseItem
 */
export default class TransientFateCard extends TransientBaseItem {
  /** @override */
  get defaultImg() { return "icons/svg/wing.svg"; }
  
  /** @override */
  get chatMessageTemplate() { return TEMPLATES.FATE_CARD_CHAT_MESSAGE; }
 
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
      flavor: game.i18n.localize("ambersteel.character.beliefSystem.fateSystem.fateCard.label"),
    });
  }

  /** @override */
  getChatViewModel(overrides = {}) {
    return new FateCardChatMessageViewModel({
      id: this.id,
      isEditable: this.isOwner,
      isSendable: this.isOwner || game.user.isGM,
      isOwner: this.isOwner,
      isGM: game.user.isGM,
      item: this.document,
      ...overrides,
    });
  }
}

ITEM_SUBTYPE.set("fate-card", (document) => { return new TransientFateCard(document) });
