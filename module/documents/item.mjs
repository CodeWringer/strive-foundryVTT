import AmbersteelFateCardItem from './subtypes/item/ambersteel-fate-card-item.mjs';
import AmbersteelIllnessItem from './subtypes/item/ambersteel-illness-item.mjs';
import AmbersteelInjuryItem from './subtypes/item/ambersteel-injury-item.mjs';
import AmbersteelItemItem from './subtypes/item/ambersteel-item-item.mjs';
import AmbersteelSkillItem from './subtypes/item/ambersteel-skill-item.mjs';
import * as UpdateUtil from "../utils/document-update-utility.mjs";

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

      if (type === "skill") {
        this._subType = new AmbersteelSkillItem(this);
      } else if (type === "fate-card") {
        this._subType = new AmbersteelFateCardItem(this);
      } else if (type === "item") {
        this._subType = new AmbersteelItemItem(this);
      } else if (type === "injury") {
        this._subType = new AmbersteelInjuryItem(this);
      } else if (type === "illness") {
        this._subType = new AmbersteelIllnessItem(this);
      } else {
        throw `Item subtype ${type} is unrecognized!`
      }
    }
    return this._subType;
  }

  /**
   * Returns the default icon image path for this type of object. 
   * @type {String}
   * @virtual
   * @readonly
   */
  get defaultImg() { return this.subType.defaultImg; }

  /** @override */
  prepareData() {
    super.prepareData();
    this.subType.prepareData(this);
  }

  /** @override */
  prepareDerivedData() {
    super.prepareDerivedData();
    this.subType.prepareDerivedData(this);
  }

  /**
   * Deletes a property on the given document, via the given path. 
   * @param {Document} document A Foundry {Document}. 
   * @param {String} propertyPath Path leading to the property to delete, on the given document entity. 
   *        Array-accessing via brackets is supported. Property-accessing via brackets is *not* supported. 
   *        E.g.: "data.attributes[0].value" 
   *        E.g.: "data.attributes[4]" 
   *        E.g.: "data.attributes" 
   * @param {Boolean | undefined} render If true, will trigger a re-render of the associated document sheet. Default 'true'. 
   * @async
   */
  async deleteByPropertyPath(propertyPath, render = true) {
    await UpdateUtil.deleteByPropertyPath(this, propertyPath, render);
  }

  /**
   * Updates a property on the parent item, identified via the given path. 
   * @param {String} propertyPath Path leading to the property to update, on the parent item. 
   *        Array-accessing via brackets is supported. Property-accessing via brackets is *not* supported. 
   *        E.g.: "data.attributes[0].value"
   * @param {any} newValue The value to assign to the property. 
   * @param {Boolean | undefined} render If true, will trigger a re-render of the associated document sheet. Default 'true'. 
   * @async
   * @protected
   */
  async updateProperty(propertyPath, newValue, render = true) {
    await UpdateUtil.updateProperty(this, propertyPath, newValue, render);
  }
}
