import { TEMPLATES } from "../../../presentation/templatePreloader.mjs";
import ScarChatMessageViewModel from "../../../presentation/sheet/item/scar/scar-chat-message-viewmodel.mjs";
import PreparedChatData from "../../../presentation/chat/prepared-chat-data.mjs";
import { SOUNDS_CONSTANTS } from "../../../presentation/audio/sounds.mjs";
import { ITEM_SUBTYPE } from "./item-subtype.mjs";
import TransientBaseItem from "./transient-base-item.mjs";
import { createUUID } from "../../util/uuid-utility.mjs";

/**
 * Represents the full transient data of a scar. 
 * 
 * @extends TransientBaseItem
 */
export default class TransientScar extends TransientBaseItem {
  /** @override */
  get defaultImg() { return "icons/svg/deaf.svg"; }
  
  /** @override */
  get chatMessageTemplate() { return TEMPLATES.SCAR_CHAT_MESSAGE; }

  /** @override */
  async getChatData() {
    const vm = this.getChatViewModel();

    const renderedContent = await renderTemplate(this.chatMessageTemplate, {
      viewModel: vm,
    });

    return new PreparedChatData({
      renderedContent: renderedContent,
      actor: (this.owningDocument ?? {}).document, 
      sound: SOUNDS_CONSTANTS.NOTIFY,
      viewModel: vm,
      flavor: game.i18n.localize("ambersteel.character.health.scar.singular"),
    });
  }

  /** @override */
  getChatViewModel(overrides = {}) {
    return new ScarChatMessageViewModel({
      id: `${this.id}-${createUUID()}`,
      isEditable: false,
      isSendable: false,
      isOwner: this.isOwner,
      isGM: game.user.isGM,
      document: this,
      ...overrides,
    });
  }
}

ITEM_SUBTYPE.set("scar", (document) => { return new TransientScar(document) });
