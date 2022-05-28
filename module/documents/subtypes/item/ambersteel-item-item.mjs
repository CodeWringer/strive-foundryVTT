import AmbersteelBaseItem from "./ambersteel-base-item.mjs";
import { TEMPLATES } from "../../../templatePreloader.mjs";
import ItemChatMessageViewModel from "../../../../templates/item/item/item-chat-message-viewmodel.mjs";

export default class AmbersteelItemItem extends AmbersteelBaseItem {
  /** @override */
  get defaultImg() { return "icons/svg/item-bag.svg"; }
  
  /** @override */
  get chatMessageTemplate() { return TEMPLATES.ITEM_CHAT_MESSAGE; }
  
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

    // Ensure number data type. 
    context.data.data.shape.width = parseInt(context.data.data.shape.width);
    context.data.data.shape.height = parseInt(context.data.data.shape.height);
  }

  /** @override */
  prepareDerivedData(context) {
    super.prepareDerivedData(context);

    this._ensureContextHasSpecifics(context);

    // Derive bulk from shape. 
    const shape = context.data.data.shape;
    if (shape === undefined) {
      game.ambersteel.logger.logWarn("Shape on item undefined! Using fallback '{ width: 1, height: 1 }'");
      shape = { width: 1, height: 1 };
    }
    context.data.data.bulk = shape.width * shape.height;
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
      flavor: game.i18n.localize("ambersteel.labels.item"),
    });
  }

  /**
   * Returns an instance of a view model for use in a chat message. 
   * @returns {ItemChatMessageViewModel}
   * @param {Object | undefined} overrides Optional. An object that allows overriding any of the view model properties. 
   * @param {String | undefined} overrides.id
   * @param {Boolean | undefined} overrides.isEditable
   * @param {Boolean | undefined} overrides.isSendable
   * @param {Boolean | undefined} overrides.isOwner
   * @param {Boolean | undefined} overrides.isGM
   * @param {Item | undefined} overrides.item
   * @param {Actor | undefined} overrides.actor
   * @param {String | undefined} overrides.sourceType
   * @param {String | undefined} overrides.sourceId
   * @param {Boolean | undefined} overrides.allowPickup
   * @param {Array<String> | undefined} overrides.allowPickupBy
   * @override
   */
  getChatViewModel(overrides = {}) {
    const base = super.getChatViewModel();
    return new ItemChatMessageViewModel({
      id: base.id,
      isEditable: base.isEditable,
      isSendable: base.isSendable,
      isOwner: base.isOwner,
      isGM: base.isGM,
      item: this,
      actor: this.parent ?? this.actor,
      sourceType: undefined,
      sourceId: undefined,
      allowPickup: false, // TODO: The user must be able to select who gets to pick this item up. 
      allowPickupBy: [], // TODO: The user must be able to select who gets to pick this item up. 
      ...overrides,
    });
  }
}
