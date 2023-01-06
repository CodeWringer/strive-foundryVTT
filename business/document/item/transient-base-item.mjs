import { TEMPLATES } from "../../../presentation/templatePreloader.mjs";
import TransientDocument from "../transient-document.mjs";

/**
 * @summary
 * Represents the base contract for a transient item object.
 * 
 * @description
 * This object provides both persisted and transient (= derived) data and 
 * type-specific methods of a given item. 
 * 
 * The item itself only serves as a "data source", being used only to write and read 
 * data to and from the data base. 
 * 
 * So, if some other code wants to access an item's derived data, they will need 
 * to first fetch an instance of an inheriting type of this class. 
 * 
 * @abstract
 * @extends TransientDocument
 * 
 * @property {TransientBaseActor | undefined} owningDocument Another document that 
 * this document is embedded in. 
 */
export default class TransientBaseItem extends TransientDocument {
  /** @override */
  get defaultImg() { return "icons/svg/item-bag.svg"; }
  
  /** @override */
  get chatMessageTemplate() { return TEMPLATES.ASSET_CHAT_MESSAGE; }
  
  /**
   * Another document that this document is embedded in. 
   * 
   * @type {TransientBaseActor | undefined}
   */
  get owningDocument() {
    if (this.document.parent !== undefined && this.document.parent !== null) {
      return this.document.parent.getTransientObject();
    } else {
      return undefined;
    }
  }
}