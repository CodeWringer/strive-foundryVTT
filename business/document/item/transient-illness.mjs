import { TEMPLATES } from "../../../presentation/template/templatePreloader.mjs";
import IllnessChatMessageViewModel from "../../../presentation/template/item/illness/illness-chat-message-viewmodel.mjs";
import PreparedChatData from "../../../presentation/chat/prepared-chat-data.mjs";
import { SOUNDS_CONSTANTS } from "../../../presentation/audio/sounds.mjs";
import { ITEM_SUBTYPE } from "./item-subtype.mjs";
import TransientBaseItem from "./transient-base-item.mjs";

/**
 * Represents the full transient data of an illness. 
 * 
 * @extends TransientBaseItem
 * 
 * @property {String} state
 * @property {String} duration
 * @property {String} treatment
 * @property {String} treatmentSkill
 */
export default class TransientIllness extends TransientBaseItem {
  /** @override */
  get defaultImg() { return "icons/svg/poison.svg"; }

  /** @override */
  get chatMessageTemplate() { return TEMPLATES.ILLNESS_CHAT_MESSAGE; }

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
  get duration() {
    return this.document.data.data.duration;
  }
  set duration(value) {
    this.document.data.data.duration = value;
    this.updateSingle("data.data.duration", value);
  }
  
  /**
   * @type {String}
   */
  get treatment() {
    return this.document.data.data.treatment;
  }
  set treatment(value) {
    this.document.data.data.treatment = value;
    this.updateSingle("data.data.treatment", value);
  }
  
  /**
   * @type {String}
   */
  get treatmentSkill() {
    return this.document.data.data.treatmentSkill;
  }
  set treatmentSkill(value) {
    this.document.data.data.treatmentSkill = value;
    this.updateSingle("data.data.treatmentSkill", value);
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
      flavor: game.i18n.localize("ambersteel.character.health.illness.singular"),
    });
  }

  /** @override */
  getChatViewModel(overrides = {}) {
    return new IllnessChatMessageViewModel({
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

ITEM_SUBTYPE.set("illness", (document) => { return new TransientIllness(document) });
