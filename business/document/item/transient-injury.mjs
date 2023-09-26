import { TEMPLATES } from "../../../presentation/templatePreloader.mjs";
import InjuryChatMessageViewModel from "../../../presentation/sheet/item/injury/injury-chat-message-viewmodel.mjs";
import PreparedChatData from "../../../presentation/chat/prepared-chat-data.mjs";
import { SOUNDS_CONSTANTS } from "../../../presentation/audio/sounds.mjs";
import { ITEM_SUBTYPE } from "./item-subtype.mjs";
import TransientBaseItem from "./transient-base-item.mjs";
import { createUUID } from "../../util/uuid-utility.mjs";

/**
 * Represents the full transient data of an injury. 
 * 
 * @extends TransientBaseItem
 * 
 * @property {String} state
 * @property {String} timeToHeal
 * @property {String} limit 
 * @property {String} scar 
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
    return this.document.system.state;
  }
  set state(value) {
    this.document.system.state = value;
    this.updateByPath("system.state", value);
  }
  
  /**
   * @type {String}
   */
  get timeToHeal() {
    return this.document.system.timeToHeal;
  }
  set timeToHeal(value) {
    this.document.system.timeToHeal = value;
    this.updateByPath("system.timeToHeal", value);
  }
  
  /**
   * @type {String}
   */
  get limit() {
    return this.document.system.limit;
  }
  /**
   * @param {String} value
   */
  set limit(value) {
    this.document.system.limit = value;
    this.updateByPath("system.limit", value);
  }
  
  /**
   * @type {String}
   */
  get scar() {
    return this.document.system.scar;
  }
  /**
   * @param {String} value
   */
  set scar(value) {
    this.document.system.scar = value;
    this.updateByPath("system.scar", value);
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

ITEM_SUBTYPE.set("injury", (document) => { return new TransientInjury(document) });
