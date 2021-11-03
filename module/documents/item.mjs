import * as FateUtil from '../utils/fate-utility.mjs';

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
      this._getChatData = FateUtil.getFateChatData.bind(this);
    }
  }

  async _getChatData() {
    return { actor: undefined, flavor: undefined, renderedContent: "", sound: "../sounds/notify.wav" };
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
