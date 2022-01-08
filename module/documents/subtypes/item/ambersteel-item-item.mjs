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
      console.warn("Shape on item undefined! Using fallback '{ width: 1, height: 1 }'");
      shape = { width: 1, height: 1 };
    }
    this.parent.data.data.bulk = shape.width * shape.height;
  }

  /** @override */
  async getChatData() {
    const messageBase = super.getChatData();
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
      }
    });

    return {
      ...messageBase,
      flavor: game.i18n.localize("ambersteel.labels.item"),
      renderedContent: renderedContent
    }
  }
}
