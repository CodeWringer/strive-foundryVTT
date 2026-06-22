import DataFieldBridge from "../data-field-bridge.mjs";
import TransientBaseItem from "./transient-base-item.mjs"

/**
 * @see `HealthConditionItemData` - Must contain all the fields defined in this data model. 
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
 * @property {TransientBaseActor | undefined} owningDocument Another 
 * document that this document is embedded in. 
 * * Read-only.
 * @property {Boolean} hasParent Returns true, if there is an owning document. 
 * * Read-only.
 * 
 * @property {Number} current
 * @property {Number} limit
 * 
 * @extends TransientBaseItem
 */
export default class TransientHealthCondition extends TransientBaseItem {
  /** @override */
  get defaultImg() { return "systems/strive/presentation/image/health-condition.svg"; }
  
  /** @override */
  get clazz() { return TransientHealthCondition; }

  /**
   * @type {Number}
   */
  get current() { return this._current.value; }
  set current(value) { this._current.value = value; }
  
  /**
   * @type {Number}
   */
  get maximum() { return this._maximum.value; }
  set maximum(value) { this._maximum.value = value; }

  /**
   * @param {GameSystemItem} document An encapsulated document instance. 
   * 
   * @throws {Error} Thrown, if `document` is `undefined`. 
   */
  constructor(document) {
    super(document);
    
    this._current = new DataFieldBridge({
      document: this,
      dataPath: "system.current",
      default: 0,
    });
    this._maximum = new DataFieldBridge({
      document: this,
      dataPath: "system.maximum",
      default: null,
    });
  }
}
