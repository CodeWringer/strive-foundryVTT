import PreparedChatData from "../../../presentation/chat/prepared-chat-data.mjs";
import { SOUNDS_CONSTANTS } from "../../../presentation/audio/sounds.mjs";
import { ITEM_SUBTYPE } from "./item-subtype.mjs";
import TransientBaseItem from "./transient-base-item.mjs";
import AssetChatMessageViewModel from "../../../presentation/sheet/item/asset/asset-chat-message-viewmodel.mjs";
import { TEMPLATES } from "../../../presentation/templatePreloader.mjs";
import { createUUID } from "../../util/uuid-utility.mjs";

/**
 * Represents the full transient data of an asset. 
 * 
 * @extends TransientBaseItem
 * 
 * @property {Number} quantity
 * @property {Number} maxQuantity
 * @property {Object} shape
 * @property {Number} shape.width
 * @property {Number} shape.height
 * @property {Boolean} isOnPerson
 * @property {Number} bulk
 * * Read-only. 
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
    return parseInt(this.document.data.data.quantity);
  }
  set quantity(value) {
    this.document.data.data.quantity = value;
    this.updateByPath("data.data.quantity", value);
  }
  
  /**
   * @type {Number}
   */
  get maxQuantity() {
    return parseInt(this.document.data.data.maxQuantity);
  }
  set maxQuantity(value) {
    this.document.data.data.maxQuantity = value;
    this.updateByPath("data.data.maxQuantity", value);
  }
  
  /**
   * @type {Object}
   */
  get shape() {
    const thiz = this;
    return {
      get width() { return parseInt(thiz.document.data.data.shape.width); },
      set width(value) { thiz.updateByPath("data.data.shape.width", value); },
      get height() { return parseInt(thiz.document.data.data.shape.height); },
      set height(value) { thiz.updateByPath("data.data.shape.height", value); },
    };
  }
  set shape(value) {
    this.document.data.data.shape = value;
    this.updateByPath("data.data.shape", value);
  }
  
  /**
   * @type {Boolean}
   */
  get isOnPerson() {
    return this.document.data.data.isOnPerson;
  }
  set isOnPerson(value) {
    this.document.data.data.isOnPerson = value;
    this.updateByPath("data.data.isOnPerson", value);
  }

  /**
   * @type {Number}
   * @readonly
   */
  get bulk() {
    return parseInt(this.document.data.data.shape.width) * parseInt(this.document.data.data.shape.height);
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
  prepareData(context) {
    super.prepareData(context);

    // Ensure number data type. 
    context.data.data.shape.width = parseInt(context.data.data.shape.width);
    context.data.data.shape.height = parseInt(context.data.data.shape.height);
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
