import BaseItem from './subtypes/base-item.mjs';
import FateCardItem from './subtypes/fate-card-item.mjs';
import SkillItem from './subtypes/skill-item.mjs';

/**
 * @extends {Item}
 */
export class AmbersteelItem extends Item {
  /**
   * Type-dependent object which pseudo-extends the logic of this object. 
   */
  subType = undefined;

  prepareData() {
    super.prepareData();
    const type = this.data.type;

    if (type === "skill") {
      this.subType = new SkillItem(this);
    } else if (type ==="fate-card") {
      this.subType = new FateCardItem(this);
    } else {
      this.subType = new BaseItem(this);
    }

    this.subType.prepareData();
  }

  /**
   * Sends this item to chat. 
   */
  async sendToChat() {
    return this.subType.sendToChat();
  }
}
