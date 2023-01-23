import PreparedChatData from "../../../presentation/chat/prepared-chat-data.mjs";
import { SOUNDS_CONSTANTS } from "../../../presentation/audio/sounds.mjs";
import { ITEM_SUBTYPE } from "./item-subtype.mjs";
import TransientBaseItem from "./transient-base-item.mjs";
import AssetChatMessageViewModel from "../../../presentation/sheet/item/asset/asset-chat-message-viewmodel.mjs";
import { TEMPLATES } from "../../../presentation/templatePreloader.mjs";
import { createUUID } from "../../util/uuid-utility.mjs";
import { ASSET_PROPERTIES } from "./item-properties.mjs";

/**
 * Represents the full transient data of an asset. 
 * 
 * @extends TransientBaseItem
 * 
 * @property {Number} quantity
 * @property {Number} maxQuantity
 * @property {Boolean} isOnPerson
 * @property {Number} bulk
 */
export default class TransientAsset extends TransientBaseItem {
  /** @override */
  get defaultImg() { return "icons/svg/item-bag.svg"; }
  
  /** @override */
  get chatMessageTemplate() { return TEMPLATES.ASSET_CHAT_MESSAGE; }
  
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

  /** @override */
  get acceptedProperties() { return ASSET_PROPERTIES.asArray; }

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
}

ITEM_SUBTYPE.set("item", (document) => { return new TransientAsset(document) });
