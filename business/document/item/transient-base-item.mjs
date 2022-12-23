import { TEMPLATES } from "../../../presentation/template/templatePreloader.mjs";
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
  get chatMessageTemplate() { return TEMPLATES.ITEM_CHAT_MESSAGE; }
  
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

    /**
   * Returns the property values identified by the `@`-denoted references in the given string, 
   * from this `Actor`. 
   * 
   * Searches: 
   * * Attribute names.
   * * Embedded skill name.
   * * Embedded skill ability name.
   * * Embedded asset name.
   * * Embedded injury name.
   * * Embedded illness name.
   * * Embedded mutation name.
   * * Embedded asset name.
   * * Embedded fate-card name.
   * 
   * @param {String} str A string containing `@`-denoted references. 
   * * E. g. `"@strength"` or localized and capitalized `"@Stärke"`. 
   * * Abbreviated attribute names are permitted, e. g. `"@wis"` instead of `"@wisdom"`. 
   * * If a reference's name contains spaces, they must be replaced with underscores. 
   * E. g. `"@Heavy_Armor"`, instead of `"@Heavy Armor"`
   * * *Can* contain property paths! These paths are considered relative to the data-property. 
   * E. g. `@a_fate_card.cost.miFP`, instead of `@a_fate_card.data.data.cost.miFP`. 
   * 
   * @returns {Map<String, Any | undefined>} A map of the reference key, including the `@`-symbol, to its resolved reference. 
   * * Only contains unique entries. No reference is included more than once. 
   */
  resolveReferences(str) {
    const result = new Map();

    const references = str.match(/@[^\s-/*+]+/g);
    if (references === undefined || references === null) {
      return result;
    }

    for (const reference of references) {
      const propertyPathMatch = reference.match(/\.[^\s-/*+]+/i);
      const propertyPath = propertyPathMatch == null ? undefined : propertyPathMatch[0].substring(1); // The property path, excluding the first dot. 
      
      const lowercaseReference = reference.toLowerCase();
      const comparableReference = (propertyPath !== undefined ? lowercaseReference.substring(1, lowercaseReference.indexOf(".", 1)): lowercaseReference.substring(1)).replaceAll("_", " ");
      if (result.has(comparableReference)) {
        // Only bother looking up a reference once. 
        continue;
      }

      if (this[comparableReference] !== undefined) {
        result.set(lowercaseReference, this[comparableReference]);
        continue;
      }
    }

    if (this.owningDocument !== undefined) {
      const otherResults = this.owningDocument.resolveReferences(str);
      otherResults.forEach((value, key) => result.set(key, value));
    }

    return result;
  }
}