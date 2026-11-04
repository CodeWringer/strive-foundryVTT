import { Callbacks } from "../../../common/callbacks.mjs";
import { ExtenderUtil } from "../../../common/util/extender-util.mjs";
import { PropertyUtil } from "../../../common/util/property-utility.mjs";
import { ValidationUtil } from "../../../common/util/validation-utility.mjs";
import AtReferencer from "../../search/at-referencer.mjs";
import DocumentUpdater from "./document-updater/document-updater.mjs";

/**
 * @summary
 * Represents the abstract base class for all documents. 
 * 
 * @description
 * Its purpose is to define a base contract that abstracts away and unifies how document data is accessed and persisted. 
 * A concrete implementation will be what gets used to interact with a specific domain type, and can be seen as a 
 * "synthetic, enhanced" version of a FoundryVTT document. 
 * 
 * @abstract Inheritors MUST implement: 
 * * `get clazz`
 * * `get id`
 * * `get type`
 * * `get pack`
 * * `get isOwner`
 * * `get isEmbedded`
 * * `get isLocked`
 * * `delete()`
 * * `openSheet()`
 * 
 * Inheritors _should_ override:
 * * `get parentDocument`
 * * `get system`
 * 
 * @property {Document} clazz
 * @property {String} defaultImg
 * @property {String} id
 * @property {String} type
 * @property {Object | undefined | null} pack
 * @property {Boolean} isOwner
 * @property {Boolean} isEmbedded
 * @property {Boolean} isLocked
 * @property {Boolean} hasParent
 * @property {Boolean} isBufferMode
 * @property {Object} system
 * @property {DocumentUpdater} _updater
 * @property {Callbacks} _onChangeCallbacks
 */
export default class Document {
  /**
   * Returns the class reference of this document. 
   * 
   * Required for extending instances thereof. 
   * 
   * @type {Document}
   * @virtual
   * @readonly
   */
  get clazz() { return Document; }

  /**
   * Returns the default icon image path for this type of document. 
   * 
   * @type {String}
   * @abstract
   * @readonly
   */
  get defaultImg() { throw Error("Not implemented"); }

  /**
   * Returns the id of the document. 
   * 
   * @type {String}
   * @abstract
   * @readonly
   */
  get id() { throw Error("Not implemented"); }

  /**
   * Returns the internal type name of the document. 
   * 
   * @type {String}
   * @abstract
   * @readonly
   */
  get type() { throw Error("Not implemented"); }

  /**
   * Returns a compendium pack this document is contained in. 
   * 
   * @type {Object | undefined | null}
   * @abstract
   * @readonly
   */
  get pack() { throw Error("Not implemented"); }

  /**
   * Returns true, if the current user is the owner of the document. 
   * 
   * @type {Boolean}
   * @abstract
   * @readonly
   */
  get isOwner() { throw Error("Not implemented"); }

  /**
   * Returns `true`, if the document is currently embedded in another. 
   * @type {Boolean}
   * @abstract
   * @readonly
   */
  get isEmbedded() { throw Error("Not implemented"); }

  /**
   * Returns `true`, if the document is currently locked. 
   * @type {Boolean}
   * @abstract
   * @readonly
   */
  get isLocked() { throw Error("Not implemented"); }

  /**
   * Returns true, if there is a parent document. 
   * @type {Boolean}
   * @readonly
   */
  get hasParent() {
    return ValidationUtil.isDefined(this.parentDocument);
  }

  /**
   * Returns true, if there is a parent document. 
   * @type {Document | null}
   * @virtual
   * @readonly
   */
  get parentDocument() { return null; }

  /**
   * If `true`, field updates do not immediately fire and get persisted, 
   * but are instead collected and aggregated, to be flushed via a `flushUpdates()` call. 
   * 
   * Setting this to `false` immediately flushes all updates. 
   * @type {Boolean}
   */
  get isBufferMode() { return this._updater.isBufferMode; }
  set isBufferMode(value) { this._updater.isBufferMode = value; }

  /**
   * Wraps access to the `system` property of the underlying document. 
   * 
   * Used to keep access to persisted data possible by familiar property paths. 
   * E.g. this ensures paths like `system.img` can work on this document instance. 
   * This is employed by the `DataFieldBridge`s to wrap access. 
   * @type {Object}
   * @virtual
   * @readonly
   */
  get system() { return {}; }

  /**
   * @type {DocumentUpdater}
   * @protected
   */
  _updater;

  /**
   * @type {Callbacks}
   * @protected
   */
  _onChangeCallbacks;

  /**
   * @param {Object} args 
   * @param {DocumentUpdater} args.updater 
   */
  constructor(args = {}) {
    ValidationUtil.validateOrThrow(args, ["updater"]);

    this._updater = args.updater;
    this._onChangeCallbacks = new Callbacks();

    ExtenderUtil.extend(this, this.clazz);
  }

  /**
   * Returns *this*. 
   * 
   * This is a convenience so a user of documents doesn't 
   * have to check whether their actor or item reference is an enhanced  
   * document ot not. Instead, a user may simply call this method on 
   * any actor or item and get an enhanced document reference to work with. 
   * 
   * Also ensures that extenders are applied! 
   * 
   * @returns {Document} 
   */
  getEnhancedDocument() {
    return this;
  }

  /**
   * Returns the value of the property, identified by the given `propertyPath`, 
   * or `undefined`, if there is no value. 
   * 
   * Handles missing pieces in the path by substituting empty objects. 
   * 
   * @param {String} propertyPath Path leading to the property to return, on the document. 
   * * Array-accessing via brackets is supported. Property-accessing via brackets is *not* supported. 
   * * E.g.: `"system.attributes[0].level"` - supported
   * * E.g.: `"system.attributes['level']"` - NOT supported
   * 
   * @returns {Any | undefined}
   */
  getByPath(propertyPath) {
    return PropertyUtil.getByPath(this, propertyPath);
  }

  /**
   * Deletes a property on the given document, via the given path. 
   * 
   * @param {Document} document A Foundry {Document}. 
   * @param {String} propertyPath Path leading to the property to delete, on the given document entity. 
   *  * Array-accessing via brackets is supported. Property-accessing via brackets is *not* supported. 
   * * E.g.: `"system.attributes[0].level" ` - supported
   * * E.g.: `"system.attributes[4]" ` - supported
   * * E.g.: `"system.attributes" ` - supported
   * * E.g.: `"system.attributes['level']"` - NOT supported
   * @param {Boolean | undefined} render If true, will trigger a re-render of the associated document sheet. 
   * * Default 'true'. 
   * @returns {Promise<void>}
   * 
   * @async
   */
  async deleteByPath(propertyPath, render = true) {
    return await this._updater.deleteByPath(propertyPath, render);
  }

  /**
   * Updates a property on the document, identified via the given path. 
   * 
   * @param {String} propertyPath Path leading to the property to update, on the document. 
   * * Array-accessing via brackets is supported. Property-accessing via brackets is *not* supported. 
   * * E.g.: `"system.attributes[0].level"` - supported
   * * E.g.: `"system.attributes['level']"` - NOT supported
   * @param {any} newValue The value to assign to the property. 
   * @param {Boolean | undefined} render If true, will trigger a re-render of the associated document sheet. 
   * * Default 'true'. 
   * @returns {Promise<void>}
   * 
   * @async
   */
  async updateByPath(propertyPath, newValue, render = true) {
    return await this._updater.updateByPath(propertyPath, newValue, render);
  }

  /**
   * Updates the document with the given `delta` object. 
   * 
   * @param {Object} delta The update delta to persist. 
   * @param {Boolean} render If true, will trigger a re-render of the associated document sheet. 
   * * Default 'true'. 
   * @returns {Promise<void>}
   * 
   * @async
   */
  async update(delta, render = true) {
    return await this._updater.update(delta, render);
  }

  /**
   * Deletes the underlying document. 
   * @returns {Promise<void>}
   * @abstract
   * @async
  */
  async delete() { throw new Error("Not implemented"); }

  /**
   * Returns the property values identified by the `@`-denoted references in the given string, 
   * from this document. 
   * 
   * @param {String} str A string containing `@`-denoted references. 
   * * E. g. `"@strength"` or localized and capitalized `"@Stärke"`. 
   * * Abbreviated attribute names are permitted, e. g. `"@wis"` instead of `"@wisdom"`. 
   * * If a reference's name contains spaces, they must be replaced with underscores. 
   * E. g. `"@Heavy_Armor"`, instead of `"@Heavy Armor"`
   * * *Can* contain property paths! E. g. `@a_fate_card.cost.miFP`. 
   * @returns {Map<String, Any | undefined>} A map of the reference key, including the `@`-symbol, to its resolved reference. 
   * * Only contains unique entries. No reference is included more than once. 
   * 
   * @virtual
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
   * * E. g. `"@A.B.c"` -> `"c"`
   * @param {String | undefined} propertyPath If not undefined, a property path on 
   * the referenced object. 
   * * E. g. `"@A.B.c"` -> `"B.c"`
   * 
   * @returns {Any | undefined} The matched reference or undefined, 
   * if no match was found. 
   * 
   * @virtual
   * @protected
   */
  resolveReference(comparableReference, propertyPath) { /** Implementation up to inheriting types. */ }

  /**
   * Persists all currently outstanding updates to the data base. 
   */
  flushUpdates() {
    this._updater.flushUpdates();
  }

  /**
   * Clears the current updates buffer. 
   */
  discardUpdates() {
    this._updater.discardUpdates();
  }

  /**
   * Adds the given `handler` to invoke when any value changes. 
   * @param {Function} handler Invoked when any value changes. Arguments: 
   * * `property: String` - Name of the property that changed. 
   * * `newValue: Any`
   * * `oldValue: Any`
   * @returns {String} Handler ID. Can be used to `remove` the handler. 
   */
  onChange(handler) {
    return this._onChangeCallbacks.add(handler);
  }

  /**
   * Removes the handle with the given `handlerId`. 
   * @param {String} handlerId 
   * @returns {Boolean} 
   */
  offChange(handlerId) {
    return this._onChangeCallbacks.remove(handlerId);
  }

  /**
   * If possible, opens the sheet that represents the document, and returns it. 
   * @returns {Promise<ApplicationV2>}
   * @async
   * @abstract
   */
  async openSheet() { throw new Error("Not implemented"); }
}
