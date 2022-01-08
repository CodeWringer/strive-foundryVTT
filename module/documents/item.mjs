import { deleteByPropertyPath } from '../utils/document-update-utility.mjs';
import AmbersteelFateCardItem from './subtypes/item/ambersteel-fate-card-item.mjs';
import AmbersteelIllnessItem from './subtypes/item/ambersteel-illness-item.mjs';
import AmbersteelInjuryItem from './subtypes/item/ambersteel-injury-item.mjs';
import AmbersteelItemItem from './subtypes/item/ambersteel-item-item.mjs';
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

  /** @override */
  prepareData() {
    super.prepareData();
    this.subType.prepareData(this);
  }

  /** @override */
  prepareDerivedData() {
    super.prepareDerivedData();
    this.subType.prepareDerivedData();
  }

  async deleteByPropertyPath(propertyPath) {
    await deleteByPropertyPath(this, propertyPath);
  }
}
