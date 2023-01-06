import { TEMPLATES } from "../../../presentation/templatePreloader.mjs";
import IllnessChatMessageViewModel from "../../../presentation/sheet/item/illness/illness-chat-message-viewmodel.mjs";
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
    this.updateByPath("data.data.state", value);
  }
  
  /**
   * @type {String}
   */
  get duration() {
    return this.document.data.data.duration;
  }
  set duration(value) {
    this.document.data.data.duration = value;
    this.updateByPath("data.data.duration", value);
  }
  
  /**
   * @type {String}
   */
  get treatment() {
    return this.document.data.data.treatment;
  }
  set treatment(value) {
    this.document.data.data.treatment = value;
    this.updateByPath("data.data.treatment", value);
  }
  
  /**
   * @type {String}
   */
  get treatmentSkill() {
    return this.document.data.data.treatmentSkill;
  }
  set treatmentSkill(value) {
    this.document.data.data.treatmentSkill = value;
    this.updateByPath("data.data.treatmentSkill", value);
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
      flavor: game.i18n.localize("ambersteel.character.health.illness.singular"),
    });
  }

  /** @override */
  getChatViewModel(overrides = {}) {
    return new IllnessChatMessageViewModel({
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

ITEM_SUBTYPE.set("illness", (document) => { return new TransientIllness(document) });
