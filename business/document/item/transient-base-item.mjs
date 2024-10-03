import { ExtenderUtil } from "../../../common/extender-util.mjs";
import Tag from "../../tags/tag.mjs";
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
 * @property {TransientBaseActor | undefined} owningDocument Another 
 * document that this document is embedded in. 
 * @property {Array<Tag>} tags An array of the current 
 * tags of this document. 
 * @property {Array<Tag>} acceptedTags Returns an array of accepted 
 * tags. 
 * * Read-only. 
 * * virtual. 
 * * Default `[]`.
 */
export default class TransientBaseItem extends TransientDocument {
  /** @override */
  get defaultImg() { return "icons/svg/item-bag.svg"; }
  
  /** @override */
  get chatMessageTemplate() { return game.strive.const.TEMPLATES.ASSET_CHAT_MESSAGE; }

  /**
   * An array of the current tags of this document. 
   * 
   * @type {Array<Tag>}
   */
  get tags() {
    const ids = (this.document.system.tags ?? this.document.system.properties) ?? [];
    const result = [];

    for (const id of ids) {
      let tag = this.acceptedTags.find(it => it.id === id);
      if (tag === undefined) {
        tag = new Tag({
          id: id,
          localizableName: id,
        });
      }
      result.push(tag);
    }

    return result;
  }
  set tags(value) {
    const ids = value.map(it => it.id);

    this.document.system.tags = ids;
    this.updateByPath("system.tags", ids);
  }
  
  /**
   * Returns an array of accepted tags. 
   * 
   * @type {Array<Tag>}
   * @readonly
   * @virtual
   * @default []
   */
  get acceptedTags() { return []; }

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
  
  /** @override */
  getExtenders() {
    return super.getExtenders().concat(ExtenderUtil.getExtenders(TransientBaseItem));
  }
}