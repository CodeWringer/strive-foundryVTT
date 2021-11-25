import AmbersteelBaseItem from "./ambersteel-base-item.mjs";

export default class AmbersteelInjuryItem extends AmbersteelBaseItem {
  /**
   * @param parent {Item} The owning Item. 
   */
  constructor(parent) {
    super(parent);
    
    this.parent.chatMessageTemplate = this.chatMessageTemplate;
    this.parent.getChatData = this.getChatData.bind(this);
  }

  /** @override */
  get img() { return "icons/svg/bones.svg"; }

  /**
   * Chat message template path. 
   * @type {String}
   */
  get chatMessageTemplate() { return "systems/ambersteel/templates/item/injury/injury-chat-message.hbs"; }

  /** @override */
  prepareData() {
    this.parent.data.img = this.img;
  }

  /** @override */
  async getChatData() {
    const messageBase = super.getChatData();
    const renderedContent = await renderTemplate(this.chatMessageTemplate, {
      data: {
        id: this.parent.id,
        name: this.parent.name,
        data: {
          description: this.parent.data.data.description,
          state: this.parent.data.data.state,
          timeToHeal: this.parent.data.data.timeToHeal,
          limit: this.parent.data.data.limit
        }
      },
      img: this.parent.img,
      isEditable: false,
      isSendable: false
    });

    return {
      ...messageBase,
      flavor: game.i18n.localize("ambersteel.labels.injury"),
      renderedContent: renderedContent
    }
  }
}
