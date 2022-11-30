// Imports of specific actor "sub-types", to ensure their imports cause the `ACTOR_SUBTYPE` map to be populated. 
import AmbersteelPcActor from './ambersteel-pc-actor.mjs';
import AmbersteelNpcActor from './ambersteel-npc-actor.mjs';
import AmbersteelPlainActor from './ambersteel-plain-actor.mjs';
import { ACTOR_SUBTYPE } from './actor-subtype.mjs';
// Other imports
import ActorChatMessageViewModel from '../../../templates/actor/actor-chat-message-viewmodel.mjs';
import PreparedChatData from '../../dto/prepared-chat-data.mjs';
import * as UpdateUtil from '../../utils/document-update-utility.mjs';
import * as ChatUtil from "../../utils/chat-utility.mjs";
import { createUUID } from '../../utils/uuid-utility.mjs';
import { SOUNDS_CONSTANTS } from '../../constants/sounds.mjs';

/**
 * @summary
 * This class represents FoundryVTT's `actor` document type. 
 * 
 * @description
 * This is both the type that is instantiated by FoundryVTT for use in actors, 
 * as well as a "base class" of sorts. To keep this class from becoming a 
 * monolithic maintenance nightmare, any type-specific things are only 
 * added _after_ this class is instantiated. 
 * 
 * To that end, via the '_getType'-method an instance of the specific type 
 * is fetched and then used in all the data preparation methods. 
 * 
 * **IMPORTANT**: The fetched sub-type instance **must not**, under any 
 * circumstance, keep a reference to *this* `Actor` instance! Such circular 
 * references would cause errors within FoundryVTT itself. 
 * 
 * The sub types add properties and methods to this `Actor` instance. 
 * That is also why this class only contains general and basic methods. 
 */
export class AmbersteelActor extends Actor {
  /**
   * Returns the default icon image path for this type of actor. 
   * @type {String}
   * @virtual
   * @readonly
   */
  get defaultImg() { return this._getType().defaultImg; }

  /**
   * Chat message template path. 
   * @type {String}
   * @readonly
   */
  get chatMessageTemplate() { return this._getType().chatMessageTemplate; }

  /** @override */
  prepareData() {
    super.prepareData();

    this._getType().prepareData(this);
  }
  
  /** @override */
  prepareBaseData() {
    super.prepareBaseData();
    
    this._getType().prepareBaseData(this);
  }
  
  /** @override */
  prepareDerivedData() {
    super.prepareDerivedData();
    
    this._getType().prepareDerivedData(this);
  }

  /**
   * Returns an instance of the specific type of this actor. 
   * @returns {AmbersteelNpcActor | AmbersteelPcActor | AmbersteelPlainActor}
   * @private
   */
  _getType() {
    const type = this.type;
    const enhancer = ACTOR_SUBTYPE.get(type);
    
    if (enhancer === undefined) {
      throw new Error(`InvalidTypeException: Actor subtype ${type} is unrecognized!`);
    }

    return enhancer;
  }

  /**
   * Returns items of this actor, filtered by the given type. 
   * @param {String} type The exact type to filter by. 
   * @returns {Array<Item>} Items of the given type, of this actor. 
   */
  getItemsByType(type) {
    const items = Array.from(this.items);
    const result = [];
    for (const item of items) {
      if (item.type === type) result.push(item);
    }
    return result;
  }

  /**
   * Deletes a property on the given document, via the given path. 
   * @param {Document} document A Foundry {Document}. 
   * @param {String} propertyPath Path leading to the property to delete, on the given document entity. 
   *        Array-accessing via brackets is supported. Property-accessing via brackets is *not* supported. 
   *        E.g.: "data.attributes[0].value" 
   *        E.g.: "data.attributes[4]" 
   *        E.g.: "data.attributes" 
   * @param {Boolean | undefined} render If true, will trigger a re-render of the associated document sheet. Default 'true'. 
   * @async
   */
  async deleteByPropertyPath(propertyPath, render = true) {
    await UpdateUtil.deleteByPropertyPath(this, propertyPath, render);
  }

  /**
   * Updates a property on the parent item, identified via the given path. 
   * @param {String} propertyPath Path leading to the property to update, on the parent item. 
   *        Array-accessing via brackets is supported. Property-accessing via brackets is *not* supported. 
   *        E.g.: "data.attributes[0].value"
   * @param {any} newValue The value to assign to the property. 
   * @param {Boolean | undefined} render If true, will trigger a re-render of the associated document sheet. Default 'true'. 
   * @async
   * @protected
   */
  async updateProperty(propertyPath, newValue, render = true) {
    await UpdateUtil.updateProperty(this, propertyPath, newValue, render);
  }

  /**
   * Base implementation of returning data for a chat message, based on this Actor. 
   * @returns {PreparedChatData}
   * @virtual
   * @async
   */
  async getChatData() {
    const actor = this;
    const vm = this.getChatViewModel();
    const renderedContent = await renderTemplate(this.chatMessageTemplate, {
      viewModel: vm,
    });

    return new PreparedChatData({
      renderedContent: renderedContent,
      actor: actor,
      sound: SOUNDS_CONSTANTS.NOTIFY,
      viewModel: vm,
    });
  }
  
  /**
   * Returns an instance of a view model for use in a chat message. 
   * @returns {ActorChatMessageViewModel}
   * @param {Object | undefined} overrides Optional. An object that allows overriding any of the view model properties. 
   * @param {String | undefined} overrides.id
   * @param {Boolean | undefined} overrides.isEditable
   * @param {Boolean | undefined} overrides.isSendable
   * @param {Boolean | undefined} overrides.isOwner
   * @param {Boolean | undefined} overrides.isGM
   * @virtual
   */
  getChatViewModel(overrides = {}) {
    return new ActorChatMessageViewModel({
      id: `${this.id}-${createUUID()}`,
      isEditable: false,
      isSendable: false,
      isOwner: this.isOwner ?? this.owner ?? false,
      isGM: game.user.isGM,
      actor: this,
      ...overrides,
    });
  }

  /**
   * Base implementation of sending this Actor to the chat. 
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
      obj: this,
      propertyPath: propertyPath,
      parent: this,
      actor: this,
      visibilityMode: visibilityMode
    });
  }
}