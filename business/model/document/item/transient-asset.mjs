import { ExtenderUtil } from "../../../../common/util/extender-util.mjs"
import { ArrayUtil } from "../../../../common/util/array-utility.mjs"
import { ASSET_TAGS } from "../../const/system-tags.mjs"
import CharacterAssetSlot from "../../../ruleset/asset/character-asset-slot.mjs"
import TransientBaseItem from "./transient-base-item.mjs"

/**
 * Represents the full transient data of an asset. 
 * 
 * @see `AssetItemData` Must contain all the fields defined in this data model. 
 * @extends TransientBaseItem
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
 * @property {String} description Html content 
 * @property {String} gmNotes Html content 
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
 * @property {String} crafting.timeIncrement.unit Must correspond to one 
 * of the `name` fields of the `TIME_UNITS` constants. 
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
  get quantity() {
    return parseInt(this.document.system.quantity);
  }
  set quantity(value) {
    this.document.system.quantity = value;
    this.updateByPath("system.quantity", value);
  }

  get quantity() {
    const thiz = this;
    return {
      get current() { return parseInt(thiz.document.system.quantity.current); },
      set current(value) {
        thiz.document.system.quantity.current = value;
        this.updateByPath("system.quantity.current", value);
      },

      get maximum() { return parseInt(thiz.document.system.quantity.maximum); },
      set maximum(value) {
        thiz.document.system.quantity.maximum = value;
        this.updateByPath("system.quantity.maximum", value);
      },
    };
  }

  /**
   * @type {Number}
   */
  get quality() { return parseInt(this.document.system.quality ?? 0); }
  set quality(value) {
    this.document.system.quality = value;
    this.updateByPath("system.quality", value);
  }

  /**
   * @type {Number}
   */
  get bulk() { return parseInt(this.document.system.bulk); }
  set bulk(value) {
    this.document.system.bulk = value;
    this.updateByPath("system.bulk", value);
  }

  /** @override */
  get acceptedTags() { return ASSET_TAGS.asArray(); }

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
