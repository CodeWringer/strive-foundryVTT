import PreparedChatData from '../../../dto/prepared-chat-data.mjs';
import * as ChatUtil from "../../../utils/chat-utility.mjs";
import { createUUID } from '../../../utils/uuid-utility.mjs';
import SheetViewModel from '../../../components/sheet-viewmodel.mjs';

export default class AmbersteelBaseItem {
  /**
   * The owning Item object. 
   * @type {Item}
   */
  parent = undefined;

  /**
   * @param parent {Item} The owning Item. 
   */
  constructor(parent) {
    if (!parent || parent === undefined) {
      throw "Argument 'owner' must not be null or undefined!"
    }
    this.parent = parent;

    this.parent.getChatData = this.getChatData.bind(this);
    this.parent.sendToChat = this.sendToChat.bind(this);
    this.parent.sendPropertyToChat = this.sendPropertyToChat.bind(this);
    this.parent.getChatViewModel = this.getChatViewModel.bind(this);
  }

  /**
   * Returns the default icon image path for this type of item. 
   * @type {String}
   * @virtual
   * @readonly
   */
  get defaultImg() { throw new Error("NotImplementedException"); }

  /**
   * Chat message template path. 
   * @type {String}
   * @readonly
   */
  get chatMessageTemplate() { throw new Error("NotImplementedException"); }

  /**
   * Prepare base data for the item. 
   * 
   * This should be non-derivable data, meaning it should only prepare the data object to ensure 
   * certain properties exist and aren't undefined. 
   * This should also set primitive data, even if it is technically derived, shouldn't be any 
   * data set based on extensive calculations. Setting the 'img'-property's path, based on the object 
   * type should be the most complex a 'calculation' as it gets. 
   * 
   * Base data *is* persisted!
   * @param {AmbersteelItem} context
   * @virtual
   */
  prepareData(context) { }

  /**
   * Prepare derived data for the item. 
   * 
   * This is where extensive calculations can occur, to ensure properties aren't 
   * undefined and have meaningful values. 
   * 
   * Derived data is *not* persisted!
   * @virtual
   */
  prepareDerivedData() { }

  /**
   * Base implementation of returning data for a chat message, based on this item. 
   * @returns {PreparedChatData}
   * @virtual
   * @async
   */
  async getChatData() {
    const actor = this.parent.parent;
    const vm = this.getChatViewModel();

    const renderedContent = await renderTemplate(this.chatMessageTemplate, {
      viewModel: vm,
    });

    return new PreparedChatData({
      renderedContent: renderedContent,
      actor: actor, 
      sound: "../sounds/notify.wav",
      viewModel: vm,
    });
  }

  /**
   * Returns an instance of a view model for use in a chat message. 
   * @returns {SheetViewModel}
   * @param {Object | undefined} overrides Optional. An object that allows overriding any of the view model properties. 
   * @param {String | undefined} overrides.id
   * @param {Boolean | undefined} overrides.isEditable
   * @param {Boolean | undefined} overrides.isSendable
   * @param {Boolean | undefined} overrides.isOwner
   * @param {Boolean | undefined} overrides.isGM
   * @virtual
   */
  getChatViewModel(overrides = {}) {
    return new SheetViewModel({
      id: `${this.parent.id}-${createUUID()}`,
      isEditable: false,
      isSendable: false,
      isOwner: this.parent.isOwner ?? this.parent.owner ?? false,
      isGM: game.user.isGM,
      ...overrides,
    });
  }

  /**
   * Base implementation of sending this item to the chat. 
   * @param {CONFIG.ambersteel.visibilityModes} visibilityMode Determines the visibility of the chat message. 
   * @async
   * @virtual
   */
  async sendToChat(visibilityMode = CONFIG.ambersteel.visibilityModes.public) {
    const chatData = await this.getChatData();
    ChatUtil.sendToChat({
      visibilityMode: visibilityMode,
      ...chatData
    });
  }

  /**
   * Sends a property of this item to chat, based on the given property path. 
   * @param {String} propertyPath 
   * @param {CONFIG.ambersteel.visibilityModes} visibilityMode 
   * @async
   */
  async sendPropertyToChat(propertyPath, visibilityMode = CONFIG.ambersteel.visibilityModes.public) {
    await ChatUtil.sendPropertyToChat({
      obj: this.parent,
      propertyPath: propertyPath,
      parent: this.parent,
      actor: this.parent.actor,
      visibilityMode: visibilityMode
    });
  }
}