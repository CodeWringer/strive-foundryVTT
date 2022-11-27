import AmbersteelBaseItem from "./ambersteel-base-item.mjs";
import { TEMPLATES } from "../../../templatePreloader.mjs";
import FateCardChatMessageViewModel from "../../../../templates/item/fate-card/fate-card-chat-message-viewmodel.mjs";
import PreparedChatData from "../../../dto/prepared-chat-data.mjs";

export default class AmbersteelFateCardItem extends AmbersteelBaseItem {
  /** @override */
  get defaultImg() { return "icons/svg/wing.svg"; }
  
  /** @override */
  get chatMessageTemplate() { return TEMPLATES.FATE_CARD_CHAT_MESSAGE; }
 
  /**
   * Ensures type-specific methods and properties are added to the given 
   * context entity. 
   * @param {Actor} context 
   * @virtual
   * @private
   */
  _ensureContextHasSpecifics(context) {
    context.getChatData = this.getChatData.bind(context);
    context.getChatViewModel = this.getChatViewModel.bind(context);
  }

  /** @override */
  prepareData(context) {
    super.prepareData(context);

    this._ensureContextHasSpecifics(context);
  }

  /** @override */
  prepareDerivedData(context) {
    super.prepareDerivedData(context);

    this._ensureContextHasSpecifics(context);
  }

  /**
   * Returns data for a chat message, based on this fate card. 
   * @returns {PreparedChatData}
   * @override
   * @async
   */
  async getChatData() {
    const actor = this.parent ?? this.actor;
    const vm = this.getChatViewModel();

    const renderedContent = await renderTemplate(this.chatMessageTemplate, {
      viewModel: vm,
    });

    return new PreparedChatData({
      renderedContent: renderedContent,
      actor: actor, 
      sound: "../sounds/notify.wav",
      viewModel: vm,
      flavor: game.i18n.localize("ambersteel.character.beliefSystem.fateSystem.fateCard.label"),
    });
  }

  /**
   * Returns an instance of a view model for use in a chat message. 
   * @returns {FateCardChatMessageViewModel}
   * @param {Object | undefined} overrides Optional. An object that allows overriding any of the view model properties. 
   * @param {String | undefined} overrides.id
   * @param {Boolean | undefined} overrides.isEditable
   * @param {Boolean | undefined} overrides.isSendable
   * @param {Boolean | undefined} overrides.isOwner
   * @param {Boolean | undefined} overrides.isGM
   * @param {Item | undefined} overrides.item
   * @override
   */
  getChatViewModel(overrides = {}) {
    return new FateCardChatMessageViewModel({
      id: this.id,
      isEditable: this.isEditable,
      isSendable: this.isSendable,
      isOwner: this.isOwner,
      isGM: this.isGM,
      item: this,
      ...overrides,
    });
  }
}
