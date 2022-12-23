import { TEMPLATES } from "../../../presentation/template/templatePreloader.mjs";
import InjuryChatMessageViewModel from "../../../presentation/template/item/injury/injury-chat-message-viewmodel.mjs";
import PreparedChatData from "../../../presentation/chat/prepared-chat-data.mjs";
import { SOUNDS_CONSTANTS } from "../../../presentation/audio/sounds.mjs";
import { ITEM_SUBTYPE } from "./item-subtype.mjs";
import TransientBaseItem from "./transient-base-item.mjs";

/**
 * Represents the full transient data of an injury. 
 * 
 * @extends TransientBaseItem
 * 
 * @property {String} state
 * @property {String} timeToHeal
 * @property {Number} limit
 */
export default class TransientInjury extends TransientBaseItem {
  /** @override */
  get defaultImg() { return "icons/svg/bones.svg"; }

  /** @override */
  get chatMessageTemplate() { return TEMPLATES.INJURY_CHAT_MESSAGE; }

  /**
   * @type {String}
   */
  get state() {
    return this.document.data.data.state;
  }
  set state(value) {
    this.document.data.data.state = value;
    this.updateSingle("data.data.state", value);
  }
  
  /**
   * @type {String}
   */
  get timeToHeal() {
    return this.document.data.data.timeToHeal;
  }
  set timeToHeal(value) {
    this.document.data.data.timeToHeal = value;
    this.updateSingle("data.data.timeToHeal", value);
  }
  
  /**
   * @type {Number}
   */
  get limit() {
    return parseInt(this.document.data.data.limit);
  }
  set limit(value) {
    this.document.data.data.limit = value;
    this.updateSingle("data.data.limit", value);
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
      flavor: game.i18n.localize("ambersteel.character.health.injury.singular"),
    });
  }

  /** @override */
  getChatViewModel(overrides = {}) {
    return new InjuryChatMessageViewModel({
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

ITEM_SUBTYPE.set("injury", (document) => { return new TransientInjury(document) });
