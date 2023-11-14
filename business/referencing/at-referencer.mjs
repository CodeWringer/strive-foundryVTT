import TransientDocument from "../document/transient-document.mjs";
import SkillAbility from "../document/item/skill/skill-ability.mjs";
import { getNestedPropertyValue } from "../util/property-utility.mjs";

/**
 * Provides a means of resolving "@"-references, using a given document. 
 */
export default class AtReferencer {
  /**
   * The regular expression pattern used to identify all `@`-references. 
   * 
   * @type {String}
   * @constant
   * @static
   * @readonly
   */
  static REGEX_PATTERN_AT_REFERENCE = /@[^\s-/*+]+/g;

  /**
   * The regular expression pattern used to find out if an `@`-reference 
   * contains a property path. 
   * 
   * @type {String}
   * @constant
   * @static
   * @readonly
   */
  static REGEX_PATTERN_PROPERTY_PATH = /\.[^\s-/*+]+/i;

  /**
   * Returns the property values identified by the `@`-denoted references in the given string, 
   * from the given document. 
   * 
   * @param {String} str A string containing `@`-denoted references. 
   * * E. g. `"@strength"` or localized and capitalized `"@Stärke"`. 
   * * Abbreviated attribute names are permitted, e. g. `"@wis"` instead of `"@wisdom"`. 
   * * If a reference's name contains spaces, they must be replaced with underscores. 
   * E. g. `"@Heavy_Armor"`, instead of `"@Heavy Armor"`
   * * *Can* contain property paths! E. g. `@a_fate_card.cost.miFP`. 
   * @param {TransientDocument | SkillAbility | Object} document The document 
   * to look for references in. 
   * 
   * @returns {Map<String, Any | undefined>} A map of the reference key, including the `@`-symbol, to its resolved reference. 
   * * Only contains unique entries. No reference is included more than once. 
   */
  resolveReferences(str, document) {
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

      const propertyPathMatch = reference.match(AtReferencer.REGEX_PATTERN_PROPERTY_PATH);
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
      
      // In case the document is embedded, choose the owning document to search in. 
      let searchDocument = document; // .owningDocument === undefined ? document : document.owningDocument;
      if (document.owningDocument !== undefined && document.owningDocument.owningDocument !== undefined) {
        // Given document is a skill ability. 
        searchDocument = document.owningDocument.owningDocument;
      } else if (document.owningDocument !== undefined) {
        searchDocument = document.owningDocument;
      }

      const match = this.resolveReference(searchDocument, comparableReference, propertyPath);
      result.set(lowercaseReference, match);
    }

    return result;
  }

  /**
   * Tries to return a match for the given reference, within the given document. 
   * 
   * @param {TransientDocument | SkillAbility | Object} document The document 
   * to look for references in. 
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
   */
  resolveReference(document, comparableReference, propertyPath) {
    if (document.name.toLowerCase() === comparableReference) {
      return document.name;
    }

    // If the document defines a resolution function, let it make its 
    // attempt, first. 
    if (document.resolveReference !== undefined) {
      const match = document.resolveReference(comparableReference, propertyPath);
      if (match !== undefined) {
        return match;
      }
    }

    // Look in properties. 
    try {
      if (propertyPath !== undefined) {
        return getNestedPropertyValue(document, propertyPath);
      }
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
   * Tries to resolve the given reference in the given list of collections. 
   * 
   * This is mostly useful for documents which hold other, embedded documents, 
   * as the `AtReferencer` won't find them, by default. They must be explicitly 
   * searched in, with *this* method. 
   * 
   * @param {Array<Array<TransientDocument | SkillAbility | Object>>} collectionsToSearch 
   * The collections to search in. 
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
   */
  resolveReferenceInCollections(collectionsToSearch, comparableReference, propertyPath) {
    for (const collection of collectionsToSearch) {
      for (const item of collection) {
        const match = this.resolveReference(item, comparableReference, propertyPath);
        if (match !== undefined) {
          return match;
        }
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
   * @private
   */
  _getReferencesIn(str) {
    const references = str.match(AtReferencer.REGEX_PATTERN_AT_REFERENCE);
    if (references === undefined || references === null) {
      return undefined;
    } else {
      return references;
    }
  }
}
