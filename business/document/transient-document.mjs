import * as ChatUtil from "../../presentation/chat/chat-utility.mjs";
import { createUUID } from '../util/uuid-utility.mjs';
import PreparedChatData from '../../presentation/chat/prepared-chat-data.mjs';
import { SOUNDS_CONSTANTS } from '../../presentation/audio/sounds.mjs';
import ViewModel from '../../presentation/view-model/view-model.mjs';
import { VISIBILITY_MODES } from '../../presentation/chat/visibility-modes.mjs';
import * as PropertyUtility from "../util/property-utility.mjs";
import DocumentUpdater from "./document-updater/document-updater.mjs";

/**
 * The regular expression pattern used to identify all `@`-references. 
 * 
 * @type {String}
 * @constant
 */
export const REGEX_PATTERN_PROPERTY_PATHS = /@[^\s-/*+]+/g;

/**
 * The regular expression pattern used to find out if an `@`-reference 
 * contains a property path. 
 * 
 * @type {String}
 * @constant
 */
export const REGEX_PATTERN_PROPERTY_PATH = /\.[^\s-/*+]+/i;

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
      logger: game.ambersteel.logger,
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
   * * E.g.: `"data.attributes[0].level" `
   * * E.g.: `"data.attributes[4]" `
   * * E.g.: `"data.attributes" `
   * @param {Boolean | undefined} render If true, will trigger a re-render of the associated document sheet. 
   * * Default 'true'. 
   * 
   * @async
   */
  async deleteByPath(propertyPath, render = true) {
    await this._updater.deleteByPath(this.document, propertyPath, render);
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
  async updateByPath(propertyPath, newValue, render = true) {
    await this._updater.updateByPath(this.document, propertyPath, newValue, render);
  }

  /**
   * Updates the document with the given `delta` object. 
   * 
   * @param {Object} delta The update delta to persist. 
   * * If aiming to update `data`, only include **one** `data` property in the `delta`.
   * E. g. `{ data: { myProperty: "myNewValue" } }`
   * @param {Boolean} render If true, will trigger a re-render of the associated document sheet. 
   * * Default 'true'. 
   */
  async update(delta, render = true) {
    this.document.update(delta, { render: render });
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
   * @param {String | undefined} overrides.id
   * @param {Boolean | undefined} overrides.isEditable
   * @param {Boolean | undefined} overrides.isSendable
   * @param {Boolean | undefined} overrides.isOwner
   * @param {Boolean | undefined} overrides.isGM
   * 
   * @returns {ViewModel}
   * 
   * @virtual
   */
  getChatViewModel(overrides = {}) {
    return new ViewModel({
      id: `${this.id}-${createUUID()}`,
      isEditable: false,
      isSendable: false,
      isOwner: this.isOwner,
      isGM: game.user.isGM,
      ...overrides,
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
   * * *Can* contain property paths! These paths are considered relative to the data-property. 
   * E. g. `@a_fate_card.cost.miFP`, instead of `@a_fate_card.system.cost.miFP`. 
   * 
   * @returns {Map<String, Any | undefined>} A map of the reference key, including the `@`-symbol, to its resolved reference. 
   * * Only contains unique entries. No reference is included more than once. 
   */
  resolveReferences(str) {
    const result = new Map();

    // Get all references from the given string. 
    const references = this._getReferencesIn(str);
    if (references === undefined) {
      return result;
    }
    
    // Resolve each reference, one by one. 
    for (const reference of references) {
      // Only the first part is converted to lower case, for easier comparisons. 
      // E. g. `"@Heavy_Armor.requiredLevel"` -> `"@heavy_armor.requiredLevel"`
      let lowercaseReference;
      // A comparable version of the reference. 
      // Comparable in the sense that underscores "_" are replaced with spaces " " 
      // or only the last piece of a property path is returned. 
      // E. g. `"@a.B.cD"` -> `"cD"`
      // E. g. `"@heavy_armor"` -> `"heavy armor"`
      let comparableReference;
      // If defined, this is the property path of the reference. 
      // E. g. `"@Heavy_Armor.requiredLevel.aBc"` -> `"requiredLevel.aBc"`
      let propertyPath;

      const propertyPathMatch = reference.match(REGEX_PATTERN_PROPERTY_PATH);
      if (propertyPathMatch !== undefined && propertyPathMatch !== null) {
        const index = propertyPathMatch.index;
        const lowerCasedFirstPart = reference.substring(0, index).toLowerCase();
        const unchangedLastPart = reference.substring(index);
        lowercaseReference = `${lowerCasedFirstPart}${unchangedLastPart}`

        // Substring to exclude the leading `@`-symbol. 
        comparableReference = lowerCasedFirstPart.substring(1);

        // The property path from the reference, excluding the leading dot. 
        // E. g. `"@a.B.cD"` -> `"B.cD"`
        propertyPath = unchangedLastPart.substring(1);
      } else {
        lowercaseReference = reference.toLowerCase();
        
        // Substring to exclude the leading `@`-symbol. 
        comparableReference = lowercaseReference.substring(1);
      }
      
      if (result.has(lowercaseReference)) {
        // Only bother looking up the same reference once. 
        continue;
      }

      // Ensure underscores are replaced with spaces. 
      comparableReference = comparableReference.replaceAll("_", " ");
      
      const match = this._resolveReference(lowercaseReference, comparableReference, propertyPath);
      if (match === undefined) {
        // In case no match was found, a 0 is returned. 
        // This is done to ensure the damage roll can still technically function 
        // without throwing an error. 
        result.set(lowercaseReference, 0);
      } else {
        result.set(lowercaseReference, match);
      }
    }

    return result;
  }

  /**
   * Tries to return a match for the given reference. 
   * 
   * @param {String} reference A reference to resolve. 
   * * E. g. `"@heavy_armor"`
   * * Can contain property paths. E. g. `"a.b.c"`
   * @param {String} comparableReference A comparable version of the reference. 
   * * Comparable in the sense that underscores "_" are replaced with spaces " " 
   * or only the last piece of a property path is returned. 
   * * E. g. `"@Heavy_Armor"` -> `"@heavy armor"`
   * * E. g. `"@A.B.c"` -> `"a"`
   * @param {String | undefined} propertyPath If not undefined, a property path on 
   * the referenced object. 
   * * E. g. `"@A.B.c"` -> `"B.c"`
   * 
   * @returns {Any | undefined} The matched reference or undefined, no match was found. 
   * 
   * @virtual
   * @protected
   */
  _resolveReference(reference, comparableReference, propertyPath) {
    if (this.name.toLowerCase() !== comparableReference) {
      return undefined;
    } else if (propertyPath === undefined) {
      return this;
    }

    // Look in own properties. 
    try {
      return PropertyUtility.getNestedPropertyValue(this, propertyPath);
    } catch (error) {
      if (error.message.startsWith("Failed to get nested property value")) {
        // Such errors are expected for "bad" property paths and can be ignored safely. 
        game.ambersteel.logger.logWarn(error.message);
      } else {
        // Any other error is re-thrown. 
        throw error;
      }
    }
    return undefined;
  }
  
  /**
   * Returns all `@` denoted references in the given string. 
   * 
   * Returns `undefined`, if no references could be found. 
   * 
   * @param {String} str A string to look in for references. 
   * 
   * @returns {Array<Object> | undefined}
   * 
   * @protected
   */
  _getReferencesIn(str) {
    const references = str.match(REGEX_PATTERN_PROPERTY_PATHS);
    if (references === undefined || references === null) {
      return undefined;
    } else {
      return references;
    }
  }
}
