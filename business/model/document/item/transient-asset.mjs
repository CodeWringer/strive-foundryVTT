import { ArrayUtil } from "../../../../common/util/array-utility.mjs"
import TransientBaseItem from "./transient-base-item.mjs"
import DataFieldBridge from "../data-field-bridge.mjs"
import { common } from "../../../../common/_module.mjs"
import { TIME_UNITS, TimeUnit } from "../../domain/const/time-units.mjs"
import AssetSlot from "../../domain/asset/asset-slot.mjs"
import ArrayDataFieldBridge from "../array-data-field-bridge.mjs"
import Complication from "../../domain/complication/complication.mjs"

/**
 * Represents the full transient data of an asset. 
 * 
 * @see `AssetItemData` - Must contain all the fields defined in this data model. 
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
 * @property {Number} bulk
 * @property {Object} quantity
 * @property {Number} quantity.current
 * @property {Number} quantity.maximum
 * @property {Number} quality
 * @property {Array<Complication>} complications
 * 
 * @property {Boolean} isProperty Returns `true`, if the asset is in the 
 * "property" section on a character sheet. 
 * * Read-only
 * @property {Boolean} isLuggage Returns `true`, if the asset is in the 
 * "luggage" section on a character sheet. 
 * * Read-only
 * @property {Boolean} isEquipped Returns `true`, if the asset is in the 
 * "equipment slots" section on a character sheet. 
 * * Read-only
 * @property {AssetSlot | null} assetSlot The current asset slot 
 * that holds this asset. 
 * * Read-only
 * 
 * @extends TransientBaseItem
 */
export default class TransientAsset extends TransientBaseItem {
  /** @override */
  get defaultImg() { return "icons/svg/item-bag.svg"; }

  /** @override */
  get clazz() { return TransientAsset; }

  /**
   * @type {Number}
   */
  get bulk() { return this._bulk.value; }
  set bulk(value) { this._bulk.value = value; }

  get quantity() {
    const thiz = this;
    return {
      get current() { return thiz._quantity.current.value; },
      set current(value) { thiz._quantity.current.value = value; },

      get maximum() { return thiz._quantity.maximum.value; },
      set maximum(value) { thiz._quantity.maximum.value = value; },
    };
  }

  /**
   * @type {Number}
   */
  get quality() { return this._quality.value; }
  set quality(value) { this._quality.value = value; }

  /**
   * @type {Array<Complication>}
   */
  get complications() { return this._complications.value; }
  set complications(value) { this._complications.value = value; }

  /**
   * Returns `true`, if the asset is in the "property" section on a 
   * character sheet. 
   * 
   * @type {Boolean}
   * @readonly
   */
  get isProperty() {
    if (this.hasParent) {
      return this.owningDocument.assets.property.find(it => it.id === this.id) !== undefined;
    } else {
      return false;
    }
  }

  /**
   * @type {Boolean}
   * @readonly
   */
  get isLuggage() {
    if (this.hasParent) {
      return this.owningDocument.assets.luggage.find(it => it.id === this.id) !== undefined;
    } else {
      return false;
    }
  }

  /**
   * @type {Boolean}
   * @readonly
   */
  get isEquipped() {
    if (this.hasParent) {
      return this.owningDocument.assets.equipment.find(it => it.id === this.id) !== undefined;
    } else {
      return false;
    }
  }

  /**
   * Returns the asset slot the asset is currently assigned to. 
   * 
   * @type {AssetSlot | null}
   * @readonly
   */
  get assetSlot() {
    if (!this.hasParent) return null;

    for (const group of this.owningDocument.assets.equipmentSlotGroups) {
      for (const slot of group.slots) {
        if (slot.alottedId === this.id) {
          return slot;
        }
      }
    }
    return null;
  }

  /**
   * @param {GameSystemItem} document An encapsulated document instance. 
   * 
   * @throws {Error} Thrown, if `document` is `undefined`. 
   */
  constructor(document) {
    super(document);

    this._bulk = new DataFieldBridge({
      document: this,
      dataPath: "system.bulk",
      default: 0,
    });

    this._quantity = {
      current: new DataFieldBridge({
        document: this,
        dataPath: "system.quantity.current",
        default: 1,
      }),
      maximum: new DataFieldBridge({
        document: this,
        dataPath: "system.quantity.maximum",
        default: null,
      }),
    };

    this._quality = new DataFieldBridge({
      document: this,
      dataPath: "system.quality",
      default: 1,
    });
    this._complications = new ArrayDataFieldBridge({
      document: this,
      dataPath: "system.complications",
      dataClass: Complication,
    });
  }

  /**
   * Moves the asset to the owning document's property list, 
   * if possible. 
   */
  moveToProperty() {
    if (this.owningDocument === undefined
      || this.isProperty === true) {
      return;
    }

    if (this.isEquipped === true) {
      this._removeFromAssetSlot();
    } else if (this.isLuggage === true) {
      this._removeFromLuggageList();
    }
    // No need to add the asset to anything. It will implicitly end up in 
    // the property list, if it is in no other list. 
  }

  /**
   * Moves the asset to the owning document's luggage list, 
   * if possible.
   */
  moveToLuggage() {
    if (this.owningDocument === undefined
      || this.isLuggage === true) {
      return;
    }

    if (this.isEquipped === true) {
      this._removeFromAssetSlot();
    }

    // Add to luggage list.
    const newLuggageList = this.owningDocument.assets.luggage.concat([this]);
    this.owningDocument.assets.luggage = newLuggageList;
  }

  /**
   * Moves the asset to the owning document's equipped list, 
   * by assigning it to the given asset slot, if possible. 
   * 
   * @param {AssetSlot} assetSlot The asset slot to 
   * assign the asset to. 
   */
  moveToAssetSlot(assetSlot) {
    if (this.owningDocument === undefined
      || (this.assetSlot ?? {}).id === assetSlot.id) {
      return;
    }

    if (this.isEquipped === true) {
      this._removeFromAssetSlot();
    } else if (this.isLuggage === true) {
      this._removeFromLuggageList();
    }

    // Assign to the given slot. 
    assetSlot.alottedId = this.id;
  }

  /**
   * Compares the bulk of this instance with a given instance and returns a numeric comparison result. 
   * 
   * @param {TransientAsset} other Another instance to compare with. 
   * 
   * @returns {Number} `-1` | `0` | `1`
   * 
   * `-1` means that this entity is less than / smaller than `other`, while `0` means equality and `1` means it 
   * is more than / greater than `other`. 
   */
  compareBulk(other) {
    return common.util.compare.compareOrdinal(this.bulk, other.bulk);
  }

  /**
   * Removes the asset from its currently assigned slot, if possible. 
   * 
   * @private
   */
  _removeFromAssetSlot() {
    const slot = this.assetSlot;
    if (slot !== undefined) {
      slot.alottedId = null;
    }
  }

  /**
   * Removes the asset from the luggage list, is possible. 
   * 
   * @private
   */
  _removeFromLuggageList() {
    const newLuggageList = ArrayUtil.arrayTakeUnless(
      this.owningDocument.assets.luggage,
      it => it.id === this.id,
    );
    // Only send the update, if the list is actually smaller. 
    if (newLuggageList.length < this.owningDocument.assets.luggage.length) {
      this.owningDocument.assets.luggage = newLuggageList;
    }
  }
}
