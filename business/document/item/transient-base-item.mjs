import InputTagsViewModel from "../../../presentation/component/input-tags/input-tags-viewmodel.mjs";
import { TEMPLATES } from "../../../presentation/templatePreloader.mjs";
import Tag from "../../tags/tag.mjs";
import ValueAdapter from "../../util/value-adapter.mjs";
import { DataField } from "../data-field.mjs";
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
 * @property {DataField< Array<Tag> >} tags An array of the current 
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
  get chatMessageTemplate() { return TEMPLATES.ASSET_CHAT_MESSAGE; }

  tags = new DataField({
    document: this,
    dataPaths: ["system.tags", "system.properties"],
    template: InputTagsViewModel.TEMPLATE,
    viewModelFunc: (parent, isOwner, isGM) => {
      return new InputTagsViewModel({
        id: "tags",
        parent: parent,
      });
    },
    defaultValue: [],
    dtoAdapter: new ValueAdapter({
      from: (value) => {
        const result = [];
  
        for (const id of value) {
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
      },
      to: (value) => {
        return value.map(it => it.id);
      }
    }),
  });
  
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
}