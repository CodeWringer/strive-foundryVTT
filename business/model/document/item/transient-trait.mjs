import MomentumAction from "../../domain/momentum-action.mjs";
import ArrayDataFieldBridge from "../array-data-field-bridge.mjs";
import TransientBaseItem from "./transient-base-item.mjs"

/**
 * @see `TraitItemData` - Must contain all the fields defined in this data model. 
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
 * @property {Array<MomentumAction>} momentumActions
 * 
 * @extends TransientBaseItem
 */
export default class TransientTrait extends TransientBaseItem {
  /** @override */
  get defaultImg() { return "icons/svg/book.svg"; }
  
  /** @override */
  get clazz() { return TransientTrait; }

  /**
   * @type {Array<MomentumAction>}
   */
  get momentumActions() { return this._momentumActions.value; }
  set momentumActions(value) { this._momentumActions.value = value; }
  
  /**
   * @param {GameSystemItem} document An encapsulated document instance. 
   * 
   * @throws {Error} Thrown, if `document` is `undefined`. 
   */
  constructor(document) {
    super(document);

    this._momentumActions = new ArrayDataFieldBridge({
      document: this,
      dataPath: "system.momentumActions",
      dataClass: MomentumAction,
    });
  }
}
