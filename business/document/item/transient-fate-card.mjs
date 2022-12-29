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
      get miFP() { return parseInt(thiz.document.data.data.cost.miFP); },
      set miFP(value) { thiz.updateByPath("data.data.cost.miFP", value); },
      get maFP() { return parseInt(thiz.document.data.data.cost.maFP); },
      set maFP(value) { thiz.updateByPath("data.data.cost.maFP", value); },
      get AFP() { return parseInt(thiz.document.data.data.cost.AFP); },
      set AFP(value) { thiz.updateByPath("data.data.cost.AFP", value); },
    };
  }
  set cost(value) {
    this.document.data.data.cost = value;
    this.updateByPath("data.data.cost", value);
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
      flavor: game.i18n.localize("ambersteel.character.beliefSystem.fateSystem.fateCard.label"),
    });
  }

  /** @override */
  getChatViewModel(overrides = {}) {
    return new FateCardChatMessageViewModel({
      id: this.id,
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
