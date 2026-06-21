import { ExtenderUtil } from "../../../../common/util/extender-util.mjs"
import { ArrayUtil } from "../../../../common/util/array-utility.mjs"
import { TIME_UNITS, TimeUnit } from "../../const/time-units.mjs"
import CharacterAssetSlot from "../../../ruleset/asset/character-asset-slot.mjs"
import TransientBaseItem from "./transient-base-item.mjs"
import DataFieldBridge from "../data-field-bridge.mjs"

/**
 * Represents the full transient data of an asset. 
 * 
 * @see `AssetItemData` Must contain all the fields defined in this data model. 
 * @extends TransientBaseItem
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
 * 
 * @property {Number} bulk
 * @property {Object} quantity
 * @property {Number} quantity.current
 * @property {Number} quantity.maximum
 * @property {Number} quality
 * @property {Object} crafting
 * @property {Number} crafting.progressIncrement
 * @property {Number} crafting.amount
 * @property {Object} crafting.timeIncrement
 * @property {Number} crafting.timeIncrement.value
 * @property {TimeUnit} crafting.timeIncrement.unit 
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
 * @property {CharacterAssetSlot | undefined} assetSlot The current asset slot 
 * that holds this asset. 
 * * Read-only
 */
export default class TransientAsset extends TransientBaseItem {
  /** @override */
  get defaultImg() { return "icons/svg/item-bag.svg"; }

  /**
   * @type {Number}
   */
  get bulk() { return this._bulk.value; }
  set bulk(value) { this._bulk.value = value; }

  get quantity() {
    const thiz = this;
    return {
      get current() { return thiz._quantityCurrent.value; },
      set current(value) { thiz._quantityCurrent.value = value; },

      get maximum() { return thiz._quantityMaximum.value; },
      set maximum(value) { thiz._quantityMaximum.value = value; },
    };
  }

  /**
   * @type {Number}
   */
  get quality() { return this._quality.value; }
  set quality(value) { this._quality.value = value; }

  get crafting() {
    const thiz = this;
    return {
      /**
       * @type {Number}
       */
      get progressIncrement() { return thiz._craftingProgressIncrement.value; },
      set progressIncrement(value) { thiz._craftingProgressIncrement.value = value; },
      
      /**
       * @type {Number}
       */
      get amount() { return thiz._craftingAmount.value; },
      set amount(value) { thiz._craftingAmount.value = value; },
      
      timeIncrement: {
        /**
         * @type {Number}
         */
        get value() { return thiz._craftingTimeIncrementValue.value; },
        set value(value) { thiz._craftingTimeIncrementValue.value = value; },
        
        /**
         * @type {TimeUnit}
         */
        get unit() { return thiz._craftingTimeIncrementUnit.value; },
        set unit(value) { thiz._craftingTimeIncrementUnit.value = value; },
      },
    };
  }

  /**
   * Returns `true`, if the asset is in the "property" section on a 
   * character sheet. 
   * 
   * @type {Boolean}
   * @readonly
   */
  get isProperty() {
    if (this.owningDocument === undefined) {
      return false;
    } else {
      return this.owningDocument.assets.property.find(it => it.id === this.id) !== undefined;
    }
  }

  /**
   * @type {Boolean}
   * @readonly
   */
  get isLuggage() {
    if (this.owningDocument === undefined) {
      return false;
    } else {
      return this.owningDocument.assets.luggage.find(it => it.id === this.id) !== undefined;
    }
  }

  /**
   * @type {Boolean}
   * @readonly
   */
  get isEquipped() {
    if (this.owningDocument === undefined) {
      return false;
    } else {
      return this.owningDocument.assets.equipment.find(it => it.id === this.id) !== undefined;
    }
  }

  /**
   * Returns the asset slot the asset is currently assigned to. 
   * 
   * @type {CharacterAssetSlot | undefined}
   * @readonly
   */
  get assetSlot() {
    if (this.owningDocument === undefined) return undefined;

    for (const group of this.owningDocument.assets.equipmentSlotGroups) {
      for (const slot of group.slots) {
        if (slot.alottedId === this.id) {
          return slot;
        }
      }
    }
    return undefined;
  }

  constructor(args = {}) {
    this._bulk = new DataFieldBridge({
      document: this,
      dataPath: "system.bulk",
      default: 0,
    });
    this._quantityCurrent = new DataFieldBridge({
      document: this,
      dataPath: "system.quantity.current",
      default: 1,
    });
    this._quantityMaximum = new DataFieldBridge({
      document: this,
      dataPath: "system.quantity.maximum",
      default: null,
    });
    this._quality = new DataFieldBridge({
      document: this,
      dataPath: "system.quality",
      default: 1,
    });
    this._craftingProgressIncrement = new DataFieldBridge({
      document: this,
      dataPath: "system.crafting.progressIncrement",
      default: 0,
    });
    this._craftingAmount = new DataFieldBridge({
      document: this,
      dataPath: "system.crafting.amount",
      default: 1,
    });
    this._craftingTimeIncrementValue = new DataFieldBridge({
      document: this,
      dataPath: "system.crafting.timeIncrement.value",
      default: 0,
    });
    this._craftingTimeIncrementUnit = new DataFieldBridge({
      document: this,
      dataPath: "system.crafting.timeIncrement.unit",
      default: TIME_UNITS.none,
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
   * @param {CharacterAssetSlot} assetSlot The asset slot to 
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
    if (this.bulk < other.bulk) {
      return -1;
    } else if (this.bulk > other.bulk) {
      return 1;
    } else {
      return 0;
    }
  }

  /** @override */
  getExtenders() {
    return super.getExtenders().concat(ExtenderUtil.getExtenders(TransientAsset));
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
