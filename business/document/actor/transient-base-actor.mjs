import { TEMPLATES } from "../../../presentation/template/templatePreloader.mjs";
import ActorChatMessageViewModel from '../../../presentation/template/actor/actor-chat-message-viewmodel.mjs';
import PreparedChatData from '../../../presentation/chat/prepared-chat-data.mjs';
import * as UpdateUtil from '../document-update-utility.mjs';
import * as ChatUtil from "../../../presentation/chat/chat-utility.mjs";
import { createUUID } from '../../util/uuid-utility.mjs';
import { SOUNDS_CONSTANTS } from '../../../presentation/audio/sounds.mjs';
import { VISIBILITY_MODES } from '../../../presentation/chat/visibility-modes.mjs';

/**
 * @summary
 * Represents the base contract for a transient actor object.
 * 
 * @description
 * This object provides both persisted and transient (= derived) data and 
 * type-specific methods of a given actor. 
 * 
 * The actor itself only serves as a "data source", being used only to write and read 
 * data to and from the data base. 
 * 
 * So, if some other code wants to access an actor's derived data, they will need 
 * to first fetch an instance of an inheriting type of this class. 
 * 
 * @abstract
 * 
 * @property {String} defaultImg Returns the default icon image path for this type of actor. 
 * * Read-only.
 * @property {String} chatMessageTemplate Returns the Chat message template path. 
 * * Read-only.
 * @property {String} id Returns the id of the document. 
 * * Read-only.
 * @property {Boolean} isOwner Returns true, if the current user is the owner of the document. 
 * * Read-only.
 * @property {Actor} document Returns the encapsulated actor instance. 
 * * Read-only.
 * @property {String} name Internal name. 
 * * Read-only.
 * @property {String} localizableName Localization key for the full name. 
 * @property {String} localizableAbbreviation Localization key for the abbreviated name. 
 * @property {Array<TransientBaseItem>} items Returns the embedded documents of the actor. 
 * * Read-only.
 */
export default class TransientBaseActor {
  /**
   * Returns the default icon image path for this type of actor. 
   * 
   * @type {String}
   * @virtual
   * @readonly
   */
  get defaultImg() { return "icons/svg/mystery-man.svg"; }

  /**
   * Returns the Chat message template path. 
   * 
   * @type {String}
   * @virtual
   * @readonly
   */
  get chatMessageTemplate() { return TEMPLATES.ACTOR_CHAT_MESSAGE; }
  
  /**
   * Returns the id of the document. 
   * 
   * @type {String}
   * @readonly
   */
  get id() { return this.document.id; }
  
  /**
   * Returns true, if the current user is the owner of the document. 
   * 
   * @type {Boolean}
   * @readonly
   */
  get isOwner() { return this.document.isOwner ?? this.document.owner ?? false; }

  /**
   * Returns the internal name of the document. 
   * 
   * @type {String}
   * @readonly
   */
  get name() { return this.document.name; }

  /**
   * Returns the embedded documents of the actor. 
   * 
   * @type {Array<TransientBaseItem>}
   * @readonly
   */
  items = [];
  
  /**
   * @param {Actor} document An encapsulated actor instance. 
   * 
   * @throws {Error} Thrown, if `document` is `undefined`. 
   */
  constructor(document) {
    if (document === undefined) {
      throw new Error("An `Actor` instance must be provided");
    }

    this.document = document;

    this.localizableName = this.name;
    this.localizableAbbreviation = this.name;

    // Get transient embedded documents. 
    this.items = Array.from(this.document.items).map(it => it.getTransientObject());
  }

  /**
   * Prepare data for the actor. 
   * 
   * **IMPORTANT**: Any changes to the actor made **will be persisted** to the 
   * data base! Therefore, **only** use this method to ensure sensible 
   * default values are set. Under no circumstance should derivable data 
   * be added here! 
   * 
   * @param {Actor} context An actor instance. 
   * 
   * @virtual
   */
  prepareData(context) { /** Actual implementation left to inheriting types. */}

  /**
   * Deletes a property on the given document, via the given path. 
   * 
   * @param {Document} document A Foundry {Document}. 
   * @param {String} propertyPath Path leading to the property to delete, on the given document entity. 
   *  * Array-accessing via brackets is supported. Property-accessing via brackets is *not* supported. 
   * * E.g.: `"data.attributes[0].level" `
   * * E.g.: `"data.attributes[4]" `
   * * E.g.: `"data.attributes" `
   * @param {Boolean | undefined} render If true, will trigger a re-render of the associated document sheet. 
   * * Default 'true'. 
   * 
   * @async
   */
  async deleteByPropertyPath(propertyPath, render = true) {
    await UpdateUtil.deleteByPropertyPath(this.document, propertyPath, render);
  }

  /**
   * Updates a property on the document, identified via the given path. 
   * 
   * @param {String} propertyPath Path leading to the property to update, on the document. 
   * * Array-accessing via brackets is supported. Property-accessing via brackets is *not* supported. 
   * * E.g.: `"data.attributes[0].level"`
   * @param {any} newValue The value to assign to the property. 
   * @param {Boolean | undefined} render If true, will trigger a re-render of the associated document sheet. 
   * * Default 'true'. 
   * 
   * @async
   * @protected
   */
  async updateProperty(propertyPath, newValue, render = true) {
    await UpdateUtil.updateProperty(this.document, propertyPath, newValue, render);
  }

  /**
   * Base implementation of returning data for a chat message, based on this actor. 
   * 
   * @returns {PreparedChatData}
   * 
   * @virtual
   * @async
   */
  async getChatData() {
    const vm = this.getChatViewModel();

    const renderedContent = await renderTemplate(this.chatMessageTemplate, {
      viewModel: vm,
    });

    return new PreparedChatData({
      renderedContent: renderedContent,
      actor: this.document,
      sound: SOUNDS_CONSTANTS.NOTIFY,
      viewModel: vm,
    });
  }
  
  /**
   * Returns an instance of a view model for use in a chat message. 
   * 
   * @param {Object | undefined} overrides Optional. An object that allows overriding any of the view model properties. 
   * @param {String | undefined} overrides.id
   * @param {Boolean | undefined} overrides.isEditable
   * @param {Boolean | undefined} overrides.isSendable
   * @param {Boolean | undefined} overrides.isOwner
   * @param {Boolean | undefined} overrides.isGM
   * 
   * @returns {ActorChatMessageViewModel}
   * 
   * @virtual
   */
  getChatViewModel(overrides = {}) {
    return new ActorChatMessageViewModel({
      id: `${this.id}-${createUUID()}`,
      isEditable: this.isOwner,
      isSendable: this.isOwner || game.user.isGM,
      isOwner: this.isOwner,
      isGM: game.user.isGM,
      actor: this,
      ...overrides,
    });
  }

  /**
   * Base implementation of sending this Actor to the chat. 
   * 
   * @param {VisibilityMode | undefined} visibilityMode Determines the visibility of the chat message. 
   * * Default `VISIBILITY_MODES.public`
   * 
   * @async
   * @virtual
   */
  async sendToChat(visibilityMode = VISIBILITY_MODES.public) {
    const chatData = await this.getChatData();
    ChatUtil.sendToChat({
      ...chatData,
      visibilityMode: visibilityMode,
    });
  }

  /**
   * Sends a property of this item to chat, based on the given property path. 
   * 
   * @param {String} propertyPath 
   * @param {VisibilityMode | undefined} visibilityMode Determines the visibility of the chat message. 
   * * Default `VISIBILITY_MODES.public`
   * 
   * @async
   */
  async sendPropertyToChat(propertyPath, visibilityMode = VISIBILITY_MODES.public) {
    await ChatUtil.sendPropertyToChat({
      obj: this.document,
      propertyPath: propertyPath,
      parent: this,
      actor: this.document,
      visibilityMode: visibilityMode
    });
  }
}