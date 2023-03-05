import { TEMPLATES } from "../../../presentation/templatePreloader.mjs";
import FateCardChatMessageViewModel from "../../../presentation/sheet/item/fate-card/fate-card-chat-message-viewmodel.mjs";
import PreparedChatData from "../../../presentation/chat/prepared-chat-data.mjs";
import { SOUNDS_CONSTANTS } from "../../../presentation/audio/sounds.mjs";
import { ITEM_SUBTYPE } from "./item-subtype.mjs";
import TransientBaseItem from "./transient-base-item.mjs";
import { createUUID } from "../../util/uuid-utility.mjs";

/**
 * Represents the full transient data of a fate card. 
 * 
 * @extends TransientBaseItem
 * 
 * @property {Object} cost
 * @property {Number} cost.miFP
 * @property {Number} cost.maFP
 * @property {Number} cost.AFP
 */
export default class TransientFateCard extends TransientBaseItem {
  /** @override */
  get defaultImg() { return "icons/svg/wing.svg"; }
  
  /** @override */
  get chatMessageTemplate() { return TEMPLATES.FATE_CARD_CHAT_MESSAGE; }
 
  /**
   * @type {Object}
   */
  get cost() {
    const thiz = this;
    return {
      get miFP() { return parseInt(thiz.document.system.cost.miFP); },
      set miFP(value) { thiz.updateByPath("system.cost.miFP", value); },
      get maFP() { return parseInt(thiz.document.system.cost.maFP); },
      set maFP(value) { thiz.updateByPath("system.cost.maFP", value); },
      get AFP() { return parseInt(thiz.document.system.cost.AFP); },
      set AFP(value) { thiz.updateByPath("system.cost.AFP", value); },
    };
  }
  set cost(value) {
    this.document.system.cost = value;
    this.updateByPath("system.cost", value);
  }
  
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
      flavor: game.i18n.localize("ambersteel.character.driverSystem.fateSystem.fateCard.label"),
    });
  }

  /** @override */
  getChatViewModel(overrides = {}) {
    return new FateCardChatMessageViewModel({
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

ITEM_SUBTYPE.set("fate-card", (document) => { return new TransientFateCard(document) });
