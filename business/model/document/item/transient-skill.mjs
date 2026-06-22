import AtReferencer from "../../../../search/at-referencer.mjs"
import TransientBaseItem from "../transient-base-item.mjs"

/**
 * Represents the full transient data of a skill. 
 * 
 * @see `SkillItemData` - Must contain all the fields defined in this data model. 
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
 * @property {Number} level The current raw level. 
 * @property {Number} levelModifier The current level modifier. This number can be negative. 
 * @property {Number} modifiedLevel The current modified level. 
 * * Read-only. 
 * @property {Number} advancementProgress 
 * @property {Array<Attribute>} baseAttributes Base attributes of the skill. 
 * * Must always contain at least one entry. By default, this is the first attribute as per the `ATTRIBUTES` definiton. 
 * @property {Array<Expertise>} expertises The array of expertises of this skill. 
 * @property {Number | undefined} apCost 
 * @property {Array<DamageAndType> | undefined} damage
 * @property {String | undefined} condition 
 * @property {Number | undefined} distance 
 * @property {String | undefined} obstacle 
 * @property {String | undefined} opposedBy 
 * @property {AttackType | undefined} attackType 
 * 
 * @extends TransientBaseItem
 */
export default class TransientSkill extends TransientBaseItem {
  /** @override */
  get defaultImg() { return "icons/svg/book.svg"; }
  
  /** @override */
  get clazz() { return TransientSkill; }
  
  /**
   * @param {Item} document An encapsulated item instance. 
   * 
   * @throws {Error} Thrown, if `document` is `undefined`. 
   */
  constructor(document) {
    super(document);
  }

  /**
   * @override
   * 
   * Also searches in: 
   * * Embedded expertises
   */
  resolveReference(comparableReference, propertyPath) {
    const collectionsToSearch = [
      this.expertises,
    ];
    const r = new AtReferencer().resolveReferenceInCollections(collectionsToSearch, comparableReference, propertyPath);
    if (r !== undefined) {
      return r;
    }

    return super.resolveReference(comparableReference, propertyPath);
  }
}
