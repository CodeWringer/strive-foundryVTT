import PreparedChatData from "../../../presentation/chat/prepared-chat-data.mjs";
import { SOUNDS_CONSTANTS } from "../../../presentation/audio/sounds.mjs";
import { ITEM_SUBTYPE } from "./item-subtype.mjs";
import TransientBaseItem from "./transient-base-item.mjs";
import AssetChatMessageViewModel from "../../../presentation/sheet/item/asset/asset-chat-message-viewmodel.mjs";
import { TEMPLATES } from "../../../presentation/templatePreloader.mjs";
import { createUUID } from "../../util/uuid-utility.mjs";
import CharacterAssetSlot from "../../ruleset/asset/character-asset-slot.mjs";
import { arrayTakeUnless } from "../../util/array-utility.mjs";
import { ASSET_TAGS } from "../../tags/system-tags.mjs";
import { DataField } from "../data-field.mjs";
import InputNumberSpinnerViewModel from "../../../presentation/component/input-number-spinner/input-number-spinner-viewmodel.mjs";
import ValueAdapter from "../../util/value-adapter.mjs";
import AssetSheetPresenter from "../../../presentation/document/asset/asset-sheet-presenter.mjs";
import AssetListItemPresenter from "../../../presentation/document/asset/asset-list-item-presenter.mjs";
import AssetChatMessagePresenter from "../../../presentation/document/asset/asset-chat-message-presenter.mjs";

/**
 * Represents the full transient data of an asset. 
 * 
 * @extends TransientBaseItem
 * 
 * @property {DataField< Number >} quantity
 * @property {DataField< Number >} maxQuantity
 * @property {DataField< Boolean >} isOnPerson
 * @property {DataField< Number >} bulk
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
  get chatMessageTemplate() { return TEMPLATES.ASSET_CHAT_MESSAGE; }
  
  quantity = new DataField({
    document: this,
    dataPaths: ["system.quantity"],
    template: InputNumberSpinnerViewModel.TEMPLATE,
    defaultValue: 1,
    viewModelFunc: (parent, isOwner, isGM) => {
      return new InputNumberSpinnerViewModel({
        id: "quantity",
        parent: parent,
        localizedToolTip: game.i18n.localize("ambersteel.character.asset.quantity.label"),
        iconHtml: '<a href="icons/svg/bones.svg"></a>',
        min: 1,
      }); 
    },
  });
  
  maxQuantity = new DataField({
    document: this,
    dataPaths: ["system.maxQuantity"],
    template: InputNumberSpinnerViewModel.TEMPLATE,
    defaultValue: 1,
    viewModelFunc: (parent, isOwner, isGM) => {
      return new InputNumberSpinnerViewModel({
        id: "maxQuantity",
        parent: parent,
        localizedToolTip: game.i18n.localize("ambersteel.character.asset.quantity.maximum"),
        iconHtml: '<a href="icons/svg/bones.svg"></a>',
        min: 1,
      }); 
    },
  });
  
  isOnPerson = new DataField({
    document: this,
    dataPaths: ["system.isOnPerson"],
    defaultValue: false,
  });

  bulk = new DataField({
    document: this,
    dataPaths: ["system.bulk"],
    template: InputNumberSpinnerViewModel.TEMPLATE,
    defaultValue: 0,
    viewModelFunc: (parent, isOwner, isGM) => {
      return new InputNumberSpinnerViewModel({
        id: "bulk",
        parent: parent,
        localizedToolTip: game.i18n.localize("ambersteel.character.asset.bulk"),
        iconHtml: '<a href="icons/svg/bones.svg"></a>',
        min: 0,
      }); 
    },
    dtoAdapter: new ValueAdapter({
      to: (value) => { parseInt(value); },
      from: (value) => { parseInt(value); },
    })
  });

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

    this.tags.viewModelFunc = (parent, isOwner, isGM) => {
      return new InputTagsViewModel({
        id: "tags",
        parent: parent,
        systemTags: ASSET_TAGS.asArray(),
      });
    }

    this.sheetPresenter = new AssetSheetPresenter({ document: this });
    this.listItemPresenter = new AssetListItemPresenter({ document: this });
    this.chatMessagePresenter = new AssetChatMessagePresenter({ document: this });
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
      flavor: game.i18n.localize("ambersteel.character.asset.singular"),
    });
  }

  /** @override */
  getChatViewModel(overrides = {}) {
    return new AssetChatMessageViewModel({
      id: `${this.id}-${createUUID()}`,
      isEditable: false,
      isSendable: false,
      isOwner: this.isOwner,
      isGM: game.user.isGM,
      document: this,
      sourceType: undefined,
      sourceId: undefined,
      allowPickup: false, // TODO #53: The user must be able to select who gets to pick this item up. 
      allowPickupBy: [], // TODO #53: The user must be able to select who gets to pick this item up. 
      ...overrides,
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

ITEM_SUBTYPE.set("item", (document) => { return new TransientAsset(document) });
