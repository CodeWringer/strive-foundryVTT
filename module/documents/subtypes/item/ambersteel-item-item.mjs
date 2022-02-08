import AmbersteelBaseItem from "./ambersteel-base-item.mjs";
import { TEMPLATES } from "../../../templatePreloader.mjs";

export default class AmbersteelItemItem extends AmbersteelBaseItem {
  /**
   * @param parent {Item} The owning Item. 
   */
  constructor(parent) {
    super(parent);
    
    this.parent.chatMessageTemplate = this.chatMessageTemplate;
    this.parent.getChatData = this.getChatData.bind(this);
  }
  
  /** @override */
  get img() { return "icons/svg/item-bag.svg"; }
  
  /**
   * Chat message template path. 
   * @type {String}
   */
  get chatMessageTemplate() { return TEMPLATES.ITEM_CHAT_MESSAGE; }
  
  /** @override */
  prepareData(context) {
    context.data.img = this.img;

    // Ensure number data type. 
    context.data.data.shape.width = parseInt(context.data.data.shape.width);
    context.data.data.shape.height = parseInt(context.data.data.shape.height);
  }
  
  prepareDerivedData() {
    // Derive bulk from shape. 
    const shape = this.parent.data.data.shape;
    if (shape === undefined) {
      game.ambersteel.logger.logWarn("Shape on item undefined! Using fallback '{ width: 1, height: 1 }'");
      shape = { width: 1, height: 1 };
    }
    this.parent.data.data.bulk = shape.width * shape.height;
  }

  /** @override */
  async getChatData() {
    const messageBase = super.getChatData();

    let sourceType = undefined;
    let sourceId = undefined;

    if (this.parent.parent !== undefined && this.parent.parent !== null) {
      // An actor is the owner. 
      sourceType = "actor";
      sourceId = this.parent.parent.id;
    } else if (this.parent.pack !== undefined && this.parent.pack !== null) {
      // A compendium pack is the owner.
      sourceType = "compendium";
    } else {
      // If neither an actor, nor a compendium own the item, then it must be owned by the world. 
      sourceType = "world"; 
    }

    const allowPickup = false; // TODO: The user must be able to select who gets to pick this item up. 

    const renderedContent = await renderTemplate(this.chatMessageTemplate, {
      isEditable: false,
      isSendable: false,
      item: {
        id: this.parent.id,
        name: this.parent.name,
        img: this.parent.img,
        data: {
          data: this.parent.data.data
        }
      },
      sourceType: sourceType,
      sourceId: sourceId,
      allowPickup: allowPickup
    });

    return {
      ...messageBase,
      flavor: game.i18n.localize("ambersteel.labels.item"),
      renderedContent: renderedContent
    }
  }
}
