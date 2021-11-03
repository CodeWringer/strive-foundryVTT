import FateCardItem from './subtypes/fate-card-item.mjs';

/**
 * @extends {Item}
 */
export class AmbersteelItem extends Item {
  subType = undefined;

  prepareData() {
    super.prepareData();
    const type = this.data.type;

    this.data.img = "icons/svg/item-bag.svg";
    if (type === "skill") {
      this.data.img = "icons/svg/book.svg";
    } else if (type ==="fate-card") {
      this.subType = new FateCardItem(this);

      this.data.img = this.subType.img;
    }
  }

  async sendToChat() {
    return this.subType.sendToChat();
  }
}
