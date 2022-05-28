import AmbersteelBaseItem from "./ambersteel-base-item.mjs";
import { TEMPLATES } from "../../../templatePreloader.mjs";
import MutationChatMessageViewModel from "../../../../templates/item/mutation/mutation-chat-message-viewmodel.mjs";

export default class AmbersteelMutationItem extends AmbersteelBaseItem {
  /** @override */
  get defaultImg() { return "icons/svg/ice-aura.svg"; }
  
  /** @override */
  get chatMessageTemplate() { return TEMPLATES.MUTATION_CHAT_MESSAGE; }

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
   * Returns data for a chat message, based on this injury. 
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
      flavor: game.i18n.localize("ambersteel.labels.mutation"),
    });
  }

  /**
   * Returns an instance of a view model for use in a chat message. 
   * @returns {MutationChatMessageViewModel}
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
    const base = super.getChatViewModel();
    return new MutationChatMessageViewModel({
      id: base.id,
      isEditable: base.isEditable,
      isSendable: base.isSendable,
      isOwner: base.isOwner,
      isGM: base.isGM,
      item: this,
      ...overrides,
    });
  }
}
