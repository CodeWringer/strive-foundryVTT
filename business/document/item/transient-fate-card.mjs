import { TEMPLATES } from "../../../presentation/templatePreloader.mjs";
import FateCardChatMessageViewModel from "../../../presentation/sheet/item/fate-card/fate-card-chat-message-viewmodel.mjs";
import PreparedChatData from "../../../presentation/chat/prepared-chat-data.mjs";
import { SOUNDS_CONSTANTS } from "../../../presentation/audio/sounds.mjs";
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
      flavor: game.i18n.localize("system.character.driverSystem.fateSystem.fateCard.label"),
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
   * @returns {FateCardChatMessageViewModel}
   * 
   * @override
   */
  getChatViewModel(overrides = {}) {
    return new FateCardChatMessageViewModel({
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
