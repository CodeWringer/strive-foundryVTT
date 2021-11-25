import AmbersteelBaseItem from "./ambersteel-base-item.mjs";

export default class AmbersteelIllnessItem extends AmbersteelBaseItem {
  /**
   * @param parent {Item} The owning Item. 
   */
  constructor(parent) {
    super(parent);
    
    this.parent.chatMessageTemplate = this.chatMessageTemplate;
    this.parent.getChatData = this.getChatData.bind(this);
  }

  /** @override */
  get img() { return "icons/svg/poison.svg"; }

  /**
   * Chat message template path. 
   * @type {String}
   */
  get chatMessageTemplate() { return "systems/ambersteel/templates/item/illness/illness-chat-message.hbs"; }

  /** @override */
  prepareData() {
    this.parent.data.img = this.img;
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
      flavor: game.i18n.localize("ambersteel.labels.illness"),
      renderedContent: renderedContent
    }
  }
}
