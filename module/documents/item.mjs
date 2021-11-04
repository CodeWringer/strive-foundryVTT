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

  /** @override */
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

  /** @override */
  prepareDerivedData() {
    super.prepareDerivedData();
    this.subType.prepareDerivedData();
  }

  /**
   * Sends this item to chat. 
   * @returns {Promise<any>} 
   * @async
   */
  async sendToChat() {
    return this.subType.sendToChat();
  }

  /**
   * Updates a property on this item, identified via the given path. 
   * @param propertyPath {String} Path leading to the property to update, on this item. 
   *        Array-accessing via brackets is supported. Property-accessing via brackets is *not* supported. 
   *        E.g.: "data.attributes[0].value"
   * @param newValue {any} The value to assign to the property. 
   * @returns {Promise<Document>} The updated Document instance
   * @async
   */
  async updateProperty(propertyPath, newValue) {
    return this.subType.updateProperty(propertyPath, newValue);
  }
}
