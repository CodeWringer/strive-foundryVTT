import AmbersteelBaseItem from "./ambersteel-base-item.mjs";
import { TEMPLATES } from "../../../templatePreloader.mjs";
import MutationChatMessageViewModel from "../../../../templates/item/mutation/mutation-chat-message-viewmodel.mjs";
import PreparedChatData from "../../../dto/prepared-chat-data.mjs";
import { SOUNDS_CONSTANTS } from "../../../constants/sounds.mjs";

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
      sound: SOUNDS_CONSTANTS.NOTIFY,
      viewModel: vm,
      flavor: game.i18n.localize("ambersteel.character.health.mutation.singular"),
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
    return new MutationChatMessageViewModel({
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
