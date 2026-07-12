import DataFieldBridge from "../data-field-bridge.mjs";
import TransientBaseItem from "./transient-base-item.mjs"

/**
 * Represents the full transient data of a fate card. 
 * 
 * @see `FateCardItemData` - Must contain all the fields defined in this data model. 
 * 
 * @property {String} defaultImg Returns the default icon image path for this type of document. 
 * * Read-only.
 * * Abstract. 
 * @property {String} clazz Returns the class reference of this document. 
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
 * @property {Array<Modifier>} modifiers Modifiers to apply to the `owningDocument`. 
 * 
 * @property {Object} cost
 * * Read-only
 * @property {Number} cost.miFP
 * @property {Number} cost.maFP
 * @property {Number} cost.AFP
 * 
 * @extends TransientBaseItem
 */
export default class TransientFateCard extends TransientBaseItem {
  /** @override */
  get defaultImg() { return "icons/svg/wing.svg"; }

  /** @override */
  get clazz() { return TransientFateCard; }

  /**
   * @type {Object}
   */
  get cost() {
    const thiz = this;
    return {
      /**
       * @type {Number}
       */
      get miFP() { return thiz._costMifp.value; },
      set miFP(value) { thiz._costMifp.value = value; },
      
      /**
       * @type {Number}
       */
      get maFP() { return thiz._costMafp.value; },
      set maFP(value) { thiz._costMafp.value = value; },
      
      /**
       * @type {Number}
       */
      get AFP() { return thiz._costAfp.value; },
      set AFP(value) { thiz._costAfp.value = value; },
    };
  }

  /**
   * @param {GameSystemItem} document An encapsulated document instance. 
   * 
   * @throws {Error} Thrown, if `document` is `undefined`. 
   */
  constructor(document) {
    super(document);
    
    this._costMifp = new DataFieldBridge({
      document: this,
      dataPath: "system.cost.miFP",
      default: 0,
    });
    this._costMafp = new DataFieldBridge({
      document: this,
      dataPath: "system.cost.maFP",
      default: 0,
    });
    this._costAfp = new DataFieldBridge({
      document: this,
      dataPath: "system.cost.AFP",
      default: 0,
    });
  }
}
