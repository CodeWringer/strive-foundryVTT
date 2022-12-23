import { TEMPLATES } from "../../../presentation/template/templatePreloader.mjs";
import ActorChatMessageViewModel from '../../../presentation/template/actor/actor-chat-message-viewmodel.mjs';
import { createUUID } from '../../util/uuid-utility.mjs';
import TransientDocument from "../transient-document.mjs";

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
 * @extends TransientDocument
 * 
 * @property {String} defaultImg Returns the default icon image path for this type of actor. 
 * * Read-only. 
 * * Virtual
 * @property {String} chatMessageTemplate Returns the Chat message template path. 
 * * Read-only. 
 * * Virtual
 * @property {Array<TransientBaseItem>} items The embedded documents of this document. 
 * * Read-only. 
 */
export default class TransientBaseActor extends TransientDocument {
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
   * @private
   */
  _items;
  /**
   * Returns the embedded documents of the actor. 
   * 
   * @type {Array<TransientBaseItem>}
   * @readonly
   */
  get items() { 
    this._items = Array.from(this.document.items).map(it => it.getTransientObject()); 
    return this._items;
  }
  
  /**
   * @param {Actor} document An encapsulated actor instance. 
   * 
   * @throws {Error} Thrown, if `document` is `undefined`. 
   */
  constructor(document) {
    super(document);

    // Ensure transient objects are instantiated at least once. 
    this._items = this.items;
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
      isEditable: false,
      isSendable: false,
      isOwner: this.isOwner,
      isGM: game.user.isGM,
      document: this,
      ...overrides,
    });
  }
}
