import TransientDocument from "../transient-document.mjs";
import { TransientBaseItem } from "../_module.mjs";

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
 * @property {String} defaultImg Returns the default icon image path for this type of document. 
 * * Read-only.
 * * Abstract. 
 * @property {String} clazz Returns the class reference of this document. 
 * Required for use in the `getExtenders` method. 
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
 * 
 * @property {Array<TransientBaseItem>} items The embedded documents of this document. 
 * * Read-only. 
 */
export default class TransientBaseActor extends TransientDocument {
  /** @override */
  get defaultImg() { return "icons/svg/mystery-man.svg"; }

  /** @override */
  get clazz() { return TransientBaseActor; }

  /**
   * Internal cache of the items which have been fetched from the Actor instance 
   * and mapped to transient objects. 
   * @type {Array<TransientBaseItem>}
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
}
