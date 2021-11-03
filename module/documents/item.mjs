/**
 * @extends {Item}
 */
export class AmbersteelItem extends Item {
  prepareData() {
    super.prepareData();
    const type = this.data.type;

    this.data.img = "icons/svg/item-bag.svg";
    if (type === "skill") {
      this.data.img = "icons/svg/book.svg";
    } else if (type ==="fate-card") {
      this.data.img = "icons/svg/wing.svg";
      this._getChatData = this._getFateChatData;
    }
  }

  async _getChatData() {
    return { actor: undefined, flavor: undefined, renderedContent: "", sound: "../sounds/notify.wav" };
  }

  async _getFateChatData() {
    const messageTemplate = "systems/ambersteel/templates/item/parts/fate-card.hbs";
    const actor = this.parent;
    const renderedContent = await renderTemplate(messageTemplate, {
      data: {
        _id: this.id,
        name: this.name,
        data: {
          description: this.data.data.description,
        }
      },
      img: this.img,
      isEditable: false
    });

    return {
      actor: actor,
      flavor: game.i18n.localize("ambersteel.fateSystem.fateCard"),
      renderedContent: renderedContent,
      sound: "../sounds/notify.wav"
    }
  }

  async sendToChat() {
    const chatData = await this._getChatData();

    return ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: chatData.actor }),
      flavor: chatData.flavor,
      content: chatData.renderedContent,
      sound: chatData.sound
    });
  }
}
