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
    }
  }
}
