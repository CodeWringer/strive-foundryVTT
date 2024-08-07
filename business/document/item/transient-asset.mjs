import PreparedChatData from "../../../presentation/chat/prepared-chat-data.mjs";
import { SOUNDS_CONSTANTS } from "../../../presentation/audio/sounds.mjs";
import TransientBaseItem from "./transient-base-item.mjs";
import AssetChatMessageViewModel from "../../../presentation/sheet/item/asset/asset-chat-message-viewmodel.mjs";
import CharacterAssetSlot from "../../ruleset/asset/character-asset-slot.mjs";
import { arrayTakeUnless } from "../../util/array-utility.mjs";
import { ASSET_TAGS } from "../../tags/system-tags.mjs";
import { getExtenders } from "../../../common/extender-util.mjs";

/**
 * Represents the full transient data of an asset. 
 * 
 * @extends TransientBaseItem
 * 
 * @property {Number} quantity
 * @property {Number} maxQuantity
 * @property {Boolean} isOnPerson
 * @property {Number} bulk
 * @property {String} location
 * @property {Boolean} isProperty Returns `true`, if the asset is in the 
 * "property" section on a character sheet. 
 * * Read-only
 * @property {Boolean} isLuggage
 * * Read-only
 * @property {Boolean} isEquipped
 * * Read-only
 * @property {CharacterAssetSlot | undefined} assetSlot
 * * Read-only
 */
export default class TransientAsset extends TransientBaseItem {
  /** @override */
  get defaultImg() { return "icons/svg/item-bag.svg"; }
  
  /** @override */
  get chatMessageTemplate() { return game.strive.const.TEMPLATES.ASSET_CHAT_MESSAGE; }
  
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
  
  /**
   * @type {Number}
   */
  get maxQuantity() {
    return parseInt(this.document.system.maxQuantity);
  }
  set maxQuantity(value) {
    this.document.system.maxQuantity = value;
    this.updateByPath("system.maxQuantity", value);
  }
  
  /**
   * @type {Boolean}
   */
  get isOnPerson() {
    return this.document.system.isOnPerson;
  }
  set isOnPerson(value) {
    this.document.system.isOnPerson = value;
    this.updateByPath("system.isOnPerson", value);
  }

  /**
   * @type {Number}
   */
  get bulk() { return parseInt(this.document.system.bulk); }
  set bulk(value) {
    this.document.system.bulk = value;
    this.updateByPath("system.bulk", value);
  }

  /**
   * @type {String}
   */
  get location() { return this.document.system.location; }
  set location(value) {
    this.document.system.location = value;
    this.updateByPath("system.location", value);
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
   * @param {Item} document An encapsulated item instance. 
   * 
   * @throws {Error} Thrown, if `document` is `undefined`. 
   */
  constructor(document) {
    super(document);
  }

  /** @override */
  async getChatData() {
    const vm = this.getChatViewModel();

    const renderedContent = await renderTemplate(this.chatMessageTemplate, {
      viewModel: vm,
    });

    return new PreparedChatData({
      renderedContent: renderedContent,
      actor: (this.owningDocument ?? {}).document, 
      sound: SOUNDS_CONSTANTS.NOTIFY,
      viewModel: vm,
      flavor: game.i18n.localize("system.character.asset.singular"),
    });
  }

  /**
   * Returns an instance of a view model for use in a chat message. 
   * 
   * @param {Object | undefined} overrides Optional. An object that allows overriding any of the view model properties. 
   * @param {ViewModel | undefined} overrides.parent A parent view model instance. 
   * In case this is an embedded document, such as an expertise, this value must be supplied 
   * for proper function. 
   * @param {String | undefined} overrides.id
   * * default is a new UUID.
   * @param {Boolean | undefined} overrides.isEditable
   * * default `false`
   * @param {Boolean | undefined} overrides.isSendable
   * * default `false`
   * 
   * @returns {AssetChatMessageViewModel}
   * 
   * @override
   */
  getChatViewModel(overrides = {}) {
    return new AssetChatMessageViewModel({
      id: overrides.id,
      parent: overrides.parent,
      isEditable: overrides.isEditable ?? false,
      isSendable: overrides.isSendable ?? false,
      isOwner: this.isOwner,
      isGM: game.user.isGM,
      document: this,
      sourceType: undefined,
      sourceId: undefined,
      allowPickup: false, // TODO #53: The user must be able to select who gets to pick this item up. 
      allowPickupBy: [], // TODO #53: The user must be able to select who gets to pick this item up. 
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
    return super.getExtenders().concat(getExtenders(TransientAsset));
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
    const newLuggageList = arrayTakeUnless(
      this.owningDocument.assets.luggage,
      it => it.id === this.id,
    );
    // Only send the update, if the list is actually smaller. 
    if (newLuggageList.length < this.owningDocument.assets.luggage.length) {
      this.owningDocument.assets.luggage = newLuggageList;
    }
  }
}
