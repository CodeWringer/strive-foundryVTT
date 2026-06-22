import AtReferencer from "../../../../search/at-referencer.mjs"
import { Expertise } from "../_module.mjs";
import DataFieldBridge from "../data-field-bridge.mjs";
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
 * @property {Array<String>} baseAttributes
 * @property {Number} level
 * @property {Array<Expertise>} expertises
 * @property {Object} itemOrders
 * * Read-only.
 * @property {Array<String>} itemOrders.expertises
 * @property {Array<String>} itemOrders.momentumActions
 * @property {Object} actionPoints
 * * Read-only.
 * @property {Boolean} actionPoints.enabled
 * @property {Number} actionPoints.current
 * @property {Object} distance
 * * Read-only.
 * @property {Boolean} distance.enabled
 * @property {Number} distance.current
 * @property {Object} targetingType
 * * Read-only.
 * @property {Boolean} targetingType.enabled
 * @property {TargetingType} targetingType.current
 * @property {Object} obstacle
 * * Read-only.
 * @property {Boolean} obstacle.enabled
 * @property {String} obstacle.current
 * @property {Object} opposedBy
 * * Read-only.
 * @property {Boolean} opposedBy.enabled
 * @property {String} opposedBy.current
 * @property {Object} advancement
 * * Read-only.
 * @property {Boolean} advancement.enabled
 * @property {Number} advancement.progress
 * @property {Array<GradedEffect>} gradedEffects
 * @property {Array<MomentumAction>} momentumActions
 * 
 * @extends TransientBaseItem
 */
export default class TransientSkill extends TransientBaseItem {
  /** @override */
  get defaultImg() { return "icons/svg/book.svg"; }
  
  /** @override */
  get clazz() { return TransientSkill; }
  
  /**
   * @type {Array<String>}
   */
  get baseAttributes() { return this._baseAttributes.value; }
  set baseAttributes(value) { this._baseAttributes.value = value; }
  
  /**
   * @type {Number}
   */
  get level() { return this._level.value; }
  set level(value) { this._level.value = value; }
  
  /**
   * @type {Array<Expertise>}
   */
  get expertises() { return this._expertises.value; }
  set expertises(value) { this._expertises.value = value; }

  /**
   * @param {Item} document An encapsulated item instance. 
   * 
   * @throws {Error} Thrown, if `document` is `undefined`. 
   */
  constructor(document) {
    super(document);

    this._baseAttributes = new DataFieldBridge({
      document: this,
      dataPath: "system.baseAttributes",
    });
    this._level = new DataFieldBridge({
      document: this,
      dataPath: "system.level",
    });
    this._expertises = new DataFieldBridge({
      document: this,
      dataPath: "system.expertises",
      fromDto: (dto) => {
        return dto.map(it => Expertise.fromDto(dto));
      },
      toDto: (value) => {
        return value.map(it => it.toDto());
      },
    });
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
