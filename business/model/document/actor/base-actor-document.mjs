import { common } from "../../../../common/_module.mjs";
import AuthenticDocument from "../authentic-document.mjs";

/**
 * Represents a Character document. 
 * 
 * @abstract
 * 
 * @property {String} defaultImg Returns the default icon image path for this type of document. 
 * * Read-only.
 * * Abstract. 
 * @property {String} clazz Returns the class reference of this document. 
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
 * @property {Array<AuthenticDocument>} items The embedded documents of this document. 
 * * Read-only. 
 * 
 * @extends AuthenticDocument
 */
export default class BaseActorDocument extends AuthenticDocument {
  /** @override */
  get defaultImg() { return "icons/svg/mystery-man.svg"; }

  /** @override */
  get clazz() { return BaseActorDocument; }

  /**
   * Internal cache of the items which have been fetched from the Actor instance 
   * and mapped to enhanced objects. 
   * @type {Array<AuthenticDocument>}
   * @private
   */
  #items;
  /**
   * Returns the embedded documents of the actor. 
   * 
   * @type {Array<AuthenticDocument>}
   * @readonly
   */
  get items() { 
    if (!common.util.validation.isDefined(this.#items)) {
      this.#items = Array.from(this.document.items).map(it => it.getEnhancedDocument()); 
    }
    return this.#items;
  }
}
