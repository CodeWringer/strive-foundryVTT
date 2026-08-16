import { common } from "../../../common/_module.mjs"
import { ExtenderUtil } from "../../../common/util/extender-util.mjs";
import { ValidationUtil } from "../../../common/util/validation-utility.mjs";
import { DOCUMENT_CONTEXT } from "../../../presentation/model/document-context.mjs";
import AtReferencer from "../../search/at-referencer.mjs"
import DataFieldBridge from "./data-field-bridge.mjs";
import DocumentUpdater from "./document-updater/document-updater.mjs"

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
 * @abstract Inheritors MUST implement: 
 * * `get defaultImg()`
 * * `get clazz()`
 * 
 * Inheritors _should_ implement:
 * * `prepareData()`
 * * `resolveReference()`
 *
 * @property {String} defaultImg Returns the default icon image path for this type of document. 
 * * Read-only.
 * * Abstract. 
 * @property {String} clazz Returns the class reference of this document. 
 * Required for extending this instance. 
 * * Read-only.
 * * Abstract. 
 * @property {String} id Returns the id of the document. 
 * * Read-only.
 * @property {String} img Returns the icon/image path of the document. 
 * @property {String} name Internal name. 
 * @property {String} description Html content.
 * @property {String | null} gmNotes Html content.
 * @property {String} documentName Returns the document type name. E. g. `"Actor"`
 * * Read-only.
 * @property {Boolean} isOwner Returns true, if the current user is the owner of the document. 
 * * Read-only.
 * @property {Item | Actor} document Returns the encapsulated document instance. 
 * * Read-only.
 * @property {String} type Internal type name. E. g. `"skill"`
 * * Read-only.
 * @property {Object | undefined | null} pack A compendium pack this document is contained in. 
 * * Read-only.
 * @property {Object} system Passes through the `document.system` field. 
 * * Read-only.
 * @property {Boolean} isTransactionMode If `true`, field updates do not immediately fire and get 
 * persisted, but are instead collected and aggregated, to be flushed via a `flushUpdates()` call. 
 * Setting this to `false` immediately flushes all updates. 
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
  get defaultImg() { throw Error("Not implemented"); }

  /**
   * Returns the class reference of this document. 
   * 
   * Required for extending this instance. 
   * 
   * @type {TransientDocument}
   * @abstract
   * @readonly
   */
  get clazz() { throw Error("Not implemented"); }

  /**
   * The icon/image path of the document. 
   * 
   * @type {String}
   */
  get img() { return this.document.img; }
  set img(value) { this.updateByPath("img", value); }

  /**
   * The internal name of the document. 
   * 
   * @type {String}
   */
  get name() { return this.document.name; }
  set name(value) { this.updateByPath("name", value); }

  /**
   * @type {String}
   */
  get description() { return this._description.value; }
  set description(value) { this._description.value = value; }

  /**
   * Arbitrary notes only visible to game-masters. 
   * 
   * @type {String | null}
   */
  get gmNotes() { return this._gmNotes.value; }
  set gmNotes(value) { this._gmNotes.value = value; }

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
   * Returns true, if the current user is the owner of the document. 
   * 
   * @type {Boolean}
   * @readonly
   */
  get isOwner() { return this.document.isOwner ?? this.document.owner ?? false; }

  /**
   * @type {Object}
   * @readonly
   */
  get system() { return this.document.system; }

  /**
   * If `true`, field updates do not immediately fire and get 
   * persisted, but are instead collected and aggregated, to be flushed via a `flushUpdates()` call. 
   * 
   * Setting this to `false` immediately flushes all updates. 
   * @type {Boolean}
   */
  get isTransactionMode() { return this._updater.isTransactionMode; }
  set isTransactionMode(value) { this._updater.isTransactionMode = value; }

  /**
   * Returns the context of the document - whether it is embedded or independent. 
   * @type {DOCUMENT_CONTEXT}
   * @readonly
   */
  get context() {
    if (ValidationUtil.isDefined(this.document.parent)) {
      // Embedded
      if (ValidationUtil.isDefined(this.document.pack) && this.document.pack.metadata.locked) {
        return DOCUMENT_CONTEXT.embedded_locked;
      } else {
        return DOCUMENT_CONTEXT.embedded;
      }
    } else {
      // Independent
      if (ValidationUtil.isDefined(this.document.pack) && this.document.pack.metadata.locked) {
        return DOCUMENT_CONTEXT.independent_locked;
      } else {
        return DOCUMENT_CONTEXT.independent;
      }
    }
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

    this._updater = new DocumentUpdater(document);
    this.document = document;

    this._gmNotes = new DataFieldBridge({
      document: this,
      dataPath: "system.gmNotes",
      default: "",
      fromDto: (dto) => {
        if (common.util.validation.isBlankOrUndefined(dto)) {
          return null;
        } else {
          return dto;
        }
      },
      toDto: (value) => {
        if (common.util.validation.isBlankOrUndefined(value)) {
          return null;
        } else {
          return value;
        }
      },
    });
    this._description = new DataFieldBridge({
      document: this,
      dataPath: "system.description",
      default: "",
    });
    ExtenderUtil.extend(this, this.clazz);
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
  prepareData(context) { /** Actual implementation left to inheriting types. */ }

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
   * 
   * @async
   */
  async deleteByPath(propertyPath, render = true) {
    await this._updater.deleteByPath(propertyPath, render);
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
   * 
   * @async
   */
  async updateByPath(propertyPath, newValue, render = true) {
    if (!this.isTransactionMode) {
      common.util.property.setNestedPropertyValue(this.document, propertyPath, newValue);
    }
    await this._updater.updateByPath(propertyPath, newValue, render);
  }

  /**
   * Returns the value of the document, identified by the given `propertyPath`, 
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
    if (propertyPath === undefined || propertyPath.trim().length < 1) {
      throw new Error(`Invalid property path '${propertyPath}'`);
    }

    const propertyNames = game.strive.util.property.splitPropertyPath(propertyPath);

    if (propertyNames.length < 1) {
      throw new Error(`Invalid property path '${propertyPath}'`);
    }

    let previousProperty = this.document;
    for (let i = 0; i < propertyNames.length - 1; i++) {
      const propertyName = propertyNames[i];
      let current = previousProperty[propertyName];

      if (common.util.validation.isDefined(current)) {
        previousProperty = current;
      } else {
        previousProperty = {};
      }
    }

    const finalPropertyName = propertyNames[propertyNames.length - 1];
    return previousProperty[finalPropertyName];
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
    await this._updater.update(delta, render);
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
   * Returns *this*. 
   * 
   * This is a convenience so a user of documents doesn't 
   * have to check whether their actor or item reference is a transient 
   * object and if not, get the transient object, if they want to 
   * access transient object properties. Instead, a user may simply call 
   * this method on any actor or item and get a transient document 
   * reference to work with. 
   * 
   * Also ensures that extenders are applied! 
   * 
   * @returns {TransientDocument} 
   */
  getTransientObject() {
    return this;
  }

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
}
