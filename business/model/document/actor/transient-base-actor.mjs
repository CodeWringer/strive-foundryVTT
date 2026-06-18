import { ExtenderUtil } from "../../../../common/extender-util.mjs";
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

  /** @override */
  getExtenders() {
    return super.getExtenders().concat(ExtenderUtil.getExtenders(TransientBaseActor));
  }
}
