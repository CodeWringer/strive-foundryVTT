import * as ChatUtil from "../../presentation/chat/chat-utility.mjs";
import PreparedChatData from '../../presentation/chat/prepared-chat-data.mjs';
import { SOUNDS_CONSTANTS } from '../../presentation/audio/sounds.mjs';
import ViewModel from '../../presentation/view-model/view-model.mjs';
import { VISIBILITY_MODES } from '../../presentation/chat/visibility-modes.mjs';
import * as PropertyUtility from "../util/property-utility.mjs";
import DocumentUpdater from "./document-updater/document-updater.mjs";
import AtReferencer from "../referencing/at-referencer.mjs";

/**
 * @summary
 * Represents the base contract for a transient document.
 * 
 * @description
 * This object provides both persisted and transient (= derived) data and 
 * type-specific methods of a given document. 
 * 
 * The document itself only serves as a "data source", being used only to write and read 
 * data to and from the data base. 
 * 
 * So, if some other code wants to access an document's derived data, they will need 
 * to first fetch an instance of an inheriting type of this class. 
 * 
 * Inheriting types **must** implement `defaultImg` and `chatMessageTemplate`.
 * 
 * @abstract
 * 
 * @property {String} defaultImg Returns the default icon image path for this type of document. 
 * * Read-only.
 * * Abstract. 
 * @property {String} chatMessageTemplate Returns the Chat message template path. 
 * * Read-only.
 * * Abstract. 
 * @property {String} documentName Returns the document type name. E. g. `"Actor"`
 * * Read-only.
 * @property {String} id Returns the id of the document. 
 * * Read-only.
 * @property {String} img Returns the icon/image path of the document. 
 * @property {Boolean} isOwner Returns true, if the current user is the owner of the document. 
 * * Read-only.
 * @property {Item | Actor} document Returns the encapsulated document instance. 
 * * Read-only.
 * @property {String} name Internal name. 
 * @property {String} localizableName Localization key for the full name. 
 * @property {String} localizableAbbreviation Localization key for the abbreviated name. 
 * @property {String} type Internal type name. E. g. `"skill"`
 * * Read-only.
 * @property {Object | undefined | null} pack A compendium pack this document is contained in. 
 * * Read-only.
 * @property {Object} displayOrders An object on which sortable lists store their entry orders. 
 * @property {String} description
 * @property {String} gmNotes
 * @property {Boolean} isCustom
 */
export default class TransientDocument {
  /**
   * Encapsulates the logic to update by property path. 
   * 
   * @type {DocumentUpdater}
   * @private
   */
  _updater;

  /**
   * Returns the default icon image path for this type of document. 
   * 
   * @type {String}
   * @abstract
   * @readonly
   */
  get defaultImg() { throw Error("NotImplementedException"); }

  /**
   * Returns the Chat message template path. 
   * 
   * @type {String}
   * @abstract
   * @readonly
   */
  get chatMessageTemplate() { throw Error("NotImplementedException"); }

  /**
   * Returns the document type name. E. g. `"Actor"`
   * 
   * @type {String}
   * @readonly
   */
  get documentName() { return this.document.documentName; }

  /**
   * Returns the id of the document. 
   * 
   * @type {String}
   * @readonly
   */
  get id() { return this.document.id; }
  
  /**
   * The icon/image path of the document. 
   * 
   * @type {String}
   */
  get img() { return this.document.img; }
  set img(value) {
    this.document.img = value;
    this.updateByPath("img", value);
  }
  
  /**
   * Returns true, if the current user is the owner of the document. 
   * 
   * @type {Boolean}
   * @readonly
   */
  get isOwner() { return this.document.isOwner ?? this.document.owner ?? false; }

  /**
   * The internal name of the document. 
   * 
   * @type {String}
   */
  get name() { return this.document.name; }
  set name(value) {
    this.document.name = value;
    this.updateByPath("name", value);
  }

  /**
   * The localized name of the document, for display in the ui. 
   * 
   * @type {String}
   * @virtual
   */
  get nameForDisplay() { return this.document.name; }

  /**
   * Returns the internal type name of the document. 
   * 
   * @type {String}
   * @readonly
   */
  get type() { return this.document.type; }

  /**
   * Returns a compendium pack this document is contained in. 
   * 
   * @type {Object | undefined | null}
   * @readonly
   */
  get pack() { return this.document.pack; }

  /**
   * @type {String}
   */
  get description() {
    return this.document.system.description;
  }
  set description(value) {
    this.document.system.description = value;
    this.updateByPath("system.description", value);
  }
  
  /**
   * @type {String}
   */
  get gmNotes() {
    return this.document.system.gmNotes;
  }
  set gmNotes(value) {
    this.document.system.gmNotes = value;
    this.updateByPath("system.gmNotes", value);
  }
  
  /**
   * @type {Boolean}
   */
  get isCustom() {
    return this.document.system.isCustom;
  }
  set isCustom(value) {
    this.document.system.isCustom = value;
    this.updateByPath("system.isCustom", value);
  }
  
  /**
   * An object on which sortable lists store their entry orders. 
   * 
   * @type {Object}
   */
  get displayOrders() {
    return this.document.system.displayOrders;
  }
  set displayOrders(value) {
    this.document.system.displayOrders = value;
    this.updateByPath("system.displayOrders", value);
  }
  
  
  /**
   * Arbitrary notes only visible to game-masters. 
   * 
   * @type {String}
   */
  get gmNotes() {
    return this.document.system.gmNotes;
  }
  set gmNotes(value) {
    this.document.system.gmNotes = value;
    this.updateByPath("system.gmNotes", value);
  }
  
  /**
   * @param {Actor | Item} document An encapsulated document instance. 
   * 
   * @throws {Error} Thrown, if `document` is `undefined`. 
   */
  constructor(document) {
    if (document === undefined) {
      throw new Error("A document instance must be provided");
    }

    this._updater = new DocumentUpdater({
      propertyUtility: PropertyUtility,
      logger: game.strive.logger,
    });

    this.document = document;
    this.localizableName = this.name;
    this.localizableAbbreviation = this.name;
  }

  /**
   * Prepare data for the document. 
   * 
   * **IMPORTANT**: Any changes to the document made **will be persisted** to the 
   * data base! Therefore, **only** use this method to ensure sensible 
   * default values are set. Under no circumstance should derivable data 
   * be added here! 
   * 
   * @param {Actor | Item} context A document instance. 
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
   * * E.g.: `"system.attributes[0].level" `
   * * E.g.: `"system.attributes[4]" `
   * * E.g.: `"system.attributes" `
   * @param {Boolean | undefined} render If true, will trigger a re-render of the associated document sheet. 
   * * Default 'true'. 
   * 
   * @async
   * @protected
   */
  async deleteByPath(propertyPath, render = true) {
    await this._updater.deleteByPath(this.document, propertyPath, render);
  }

  /**
   * Updates a property on the document, identified via the given path. 
   * 
   * @param {String} propertyPath Path leading to the property to update, on the document. 
   * * Array-accessing via brackets is supported. Property-accessing via brackets is *not* supported. 
   * * E.g.: `"system.attributes[0].level"`
   * @param {any} newValue The value to assign to the property. 
   * @param {Boolean | undefined} render If true, will trigger a re-render of the associated document sheet. 
   * * Default 'true'. 
   * 
   * @async
   * @protected
   */
  async updateByPath(propertyPath, newValue, render = true) {
    await this._updater.updateByPath(this.document, propertyPath, newValue, render);
  }

  /**
   * Updates the document with the given `delta` object. 
   * 
   * @param {Object} delta The update delta to persist. 
   * @param {Boolean} render If true, will trigger a re-render of the associated document sheet. 
   * * Default 'true'. 
   * 
   * @async
   */
  async update(delta, render = true) {
    await this.document.update(delta, { render: render });
  }

  /**
   * Base implementation of returning data for a chat message, based on this document. 
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
      actor: this.document.parent ?? this.document, 
      sound: SOUNDS_CONSTANTS.NOTIFY,
      viewModel: vm,
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
   * @returns {ViewModel}
   * 
   * @virtual
   */
  getChatViewModel(overrides = {}) {
    return new ViewModel({
      id: overrides.id,
      parent: overrides.parent,
      isEditable: overrides.isEditable ?? false,
      isSendable: overrides.isSendable ?? false,
      isOwner: this.isOwner,
      isGM: game.user.isGM,
    });
  }

  /**
   * Base implementation of sending this document to the chat. 
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
   * Sends a property of this document to chat, based on the given property path. 
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
      actor: this.document.parent ?? this.document,
      visibilityMode: visibilityMode
    });
  }

  /**
   * Deletes the underlying document. 
   */
  delete() {
    this.document.delete();
  }

  /**
   * Returns the property values identified by the `@`-denoted references in the given string, 
   * from this `TransientDocument`. 
   * 
   * @param {String} str A string containing `@`-denoted references. 
   * * E. g. `"@strength"` or localized and capitalized `"@Stärke"`. 
   * * Abbreviated attribute names are permitted, e. g. `"@wis"` instead of `"@wisdom"`. 
   * * If a reference's name contains spaces, they must be replaced with underscores. 
   * E. g. `"@Heavy_Armor"`, instead of `"@Heavy Armor"`
   * * *Can* contain property paths! E. g. `@a_fate_card.cost.miFP`. 
   * 
   * @returns {Map<String, Any | undefined>} A map of the reference key, including the `@`-symbol, to its resolved reference. 
   * * Only contains unique entries. No reference is included more than once. 
   */
  resolveReferences(str) {
    return new AtReferencer().resolveReferences(str, this);
  }

  /**
   * Tries to resolve the given reference. 
   * 
   * This method will be called implicitly, by an `AtReferencer`, when it tries 
   * to resolve a reference on *this* document. 
   * 
   * @param {String} comparableReference A comparable version of a reference. 
   * * Comparable in the sense that underscores "_" are replaced with spaces " " 
   * or only the last piece of a property path is returned. 
   * * E. g. `"@Heavy_Armor"` -> `"@heavy armor"`
   * * E. g. `"@A.B.c"` -> `"a"`
   * @param {String | undefined} propertyPath If not undefined, a property path on 
   * the referenced object. 
   * * E. g. `"@A.B.c"` -> `"B.c"`
   * 
   * @returns {Any | undefined} The matched reference or undefined, 
   * if no match was found. 
   * 
   * @virtual
   */
  resolveReference(comparableReference, propertyPath) { /** Implementation up to inheriting types. */ }

  /**
   * Returns *this*. 
   * 
   * This is a convenience so a user of documents doesn't 
   * have to check whether their actor or item reference is a transient 
   * object and if not, get the transient object, if they want to 
   * access transient object properties. Instead, a user may simply call 
   * this method on any actor or item and get a transient document 
   * reference to work with. 
   * 
   * @returns {TransientDocument} 
   */
  getTransientObject() {
    return this;
  }
}
