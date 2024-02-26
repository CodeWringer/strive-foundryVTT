import { TEMPLATES } from "../../../presentation/templatePreloader.mjs";
import IllnessChatMessageViewModel from "../../../presentation/sheet/item/illness/illness-chat-message-viewmodel.mjs";
import PreparedChatData from "../../../presentation/chat/prepared-chat-data.mjs";
import { SOUNDS_CONSTANTS } from "../../../presentation/audio/sounds.mjs";
import { ITEM_SUBTYPE } from "./item-subtype.mjs";
import TransientBaseItem from "./transient-base-item.mjs";
import { createUUID } from "../../util/uuid-utility.mjs";

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
    return this.document.system.state;
  }
  set state(value) {
    this.document.system.state = value;
    this.updateByPath("system.state", value);
  }
  
  /**
   * @type {String}
   */
  get duration() {
    return this.document.system.duration;
  }
  set duration(value) {
    this.document.system.duration = value;
    this.updateByPath("system.duration", value);
  }
  
  /**
   * @type {String}
   */
  get treatment() {
    return this.document.system.treatment;
  }
  set treatment(value) {
    this.document.system.treatment = value;
    this.updateByPath("system.treatment", value);
  }
  
  /**
   * @type {String}
   */
  get treatmentSkill() {
    return this.document.system.treatmentSkill;
  }
  set treatmentSkill(value) {
    this.document.system.treatmentSkill = value;
    this.updateByPath("system.treatmentSkill", value);
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
      flavor: game.i18n.localize("system.character.health.illness.singular"),
    });
  }

  /**
   * Returns an instance of a view model for use in a chat message. 
   * 
   * @param {Object | undefined} overrides Optional. An object that allows overriding any of the view model properties. 
   * @param {ViewModel | undefined} overrides.parent A parent view model instance. 
   * In case this is an embedded document, such as an expertise, this value must be supplied 
   * for proper function. 
   * @param {String | undefined} overrides.id
   * * default is a new UUID.
   * @param {Boolean | undefined} overrides.isEditable
   * * default `false`
   * @param {Boolean | undefined} overrides.isSendable
   * * default `false`
   * 
   * @returns {IllnessChatMessageViewModel}
   * 
   * @override
   */
  getChatViewModel(overrides = {}) {
    return new IllnessChatMessageViewModel({
      id: overrides.id,
      parent: overrides.parent,
      isEditable: overrides.isEditable ?? false,
      isSendable: overrides.isSendable ?? false,
      isOwner: this.isOwner,
      isGM: game.user.isGM,
      document: this,
    });
  }
}

ITEM_SUBTYPE.set("illness", (document) => { return new TransientIllness(document) });
