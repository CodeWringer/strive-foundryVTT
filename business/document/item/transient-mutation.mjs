import { TEMPLATES } from "../../../presentation/template/templatePreloader.mjs";
import MutationChatMessageViewModel from "../../../presentation/template/item/mutation/mutation-chat-message-viewmodel.mjs";
import PreparedChatData from "../../../presentation/chat/prepared-chat-data.mjs";
import { SOUNDS_CONSTANTS } from "../../../presentation/audio/sounds.mjs";
import { ITEM_SUBTYPE } from "./item-subtype.mjs";
import TransientBaseItem from "./transient-base-item.mjs";

/**
 * Represents the full transient data of a mutation. 
 * 
 * @extends TransientBaseItem
 */
export default class TransientMutation extends TransientBaseItem {
  /** @override */
  get defaultImg() { return "icons/svg/ice-aura.svg"; }
  
  /** @override */
  get chatMessageTemplate() { return TEMPLATES.MUTATION_CHAT_MESSAGE; }

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
      flavor: game.i18n.localize("ambersteel.character.health.mutation.singular"),
    });
  }

  /** @override */
  getChatViewModel(overrides = {}) {
    return new MutationChatMessageViewModel({
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

ITEM_SUBTYPE.set("mutation", (document) => { return new TransientMutation(document) });