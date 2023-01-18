import { TEMPLATES } from "../../../presentation/templatePreloader.mjs";
import DocumentProperty from "../document-property.mjs";
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
 * @property {Array<DocumentProperty>} properties An array of the current document 
 * properties of this document. 
 * @property {Array<DocumentProperty>} acceptedProperties Returns an array of accepted 
 * document properties. 
 * * Read-only. 
 * * virtual. 
 * * Default `[]`.
 */
export default class TransientBaseItem extends TransientDocument {
  /** @override */
  get defaultImg() { return "icons/svg/item-bag.svg"; }
  
  /** @override */
  get chatMessageTemplate() { return TEMPLATES.ASSET_CHAT_MESSAGE; }

  /**
   * An array of the current document properties of this document. 
   * 
   * @type {Array<DocumentProperty>}
   */
  get properties() {
    const ids = this.document.system.properties;
    const accepted = this.acceptedProperties;
    const result = [];

    for (const id of ids) {
      let property = accepted.find(it => it.id === id);
      if (property === undefined) {
        property = new DocumentProperty({
          id: id,
          localizableName: id,
        });
      }
      result.push(property);
    }

    return result;
  }
  set properties(value) {
    const ids = value.map(it => it.id);

    this.document.system.properties = ids;
    this.updateByPath("system.properties", ids);
  }
  
  /**
   * Returns an array of accepted document properties. 
   * 
   * @type {Array<DocumentProperty>}
   * @readonly
   * @virtual
   * @default []
   */
  get acceptedProperties() { return []; }

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