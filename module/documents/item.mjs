import AmbersteelBaseItem from './subtypes/item/ambersteel-base-item.mjs';
import AmbersteelFateCardItem from './subtypes/item/ambersteel-fate-card-item.mjs';
import AmbersteelSkillItem from './subtypes/item/ambersteel-skill-item.mjs';

export class AmbersteelItem extends Item {
  /**
   * @private
   */
  _subType = undefined;
  /**
   * Type-dependent object which pseudo-extends the logic of this object. 
   */
  get subType() {
    if (!this._subType) {
      const type = this.data.type;

      // TODO: Generalize
      if (type === "skill") {
        this._subType = new AmbersteelSkillItem(this);
      } else if (type === "fate-card") {
        this._subType = new AmbersteelFateCardItem(this);
      } else if (type === "item") {
        this._subType = new AmbersteelBaseItem(this);
      } else {
        throw `Item subtype ${type} is unrecognized!`
      }
    }
    return this._subType;
  }

  /** @override */
  prepareData() {
    super.prepareData();
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
   * @async
   */
  async updateProperty(propertyPath, newValue) {
    await this.subType.updateProperty(propertyPath, newValue);
  }
}
