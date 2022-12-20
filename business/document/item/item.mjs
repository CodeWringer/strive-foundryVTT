import { ITEM_SUBTYPE } from './item-subtype.mjs';

/**
 * @summary
 * This class represents FoundryVTT's `Item` document type. 
 * 
 * @description
 * In truth, this class only serves as a "data source" and should never be worked with 
 * directly. Instead, an instance of `TransientBaseItem` should be fetched via the 
 * `getTransientObject`-method and used instead. 
 * 
 * @see TransientBaseItem
 */
export class AmbersteelItem extends Item {
  /**
   * Returns the default icon image path for this type of object. 
   * @type {String}
   * @virtual
   * @readonly
   */
  get defaultImg() { return this._getType().defaultImg; }

  /**
   * Chat message template path. 
   * @type {String}
   * @readonly
   */
  get chatMessageTemplate() { return this._getType().chatMessageTemplate; }

  /** @override */
  prepareData() {
    super.prepareData();

    this.getTransientObject().prepareData(this);
  }

  /**
   * Returns an instance of a specific type of transient object for this item. 
   * 
   * @returns {TransientBaseItem}
   */
  getTransientObject() {
    const factoryFunction = ITEM_SUBTYPE.get(this.type);
    
    if (factoryFunction === undefined) {
      throw new Error(`InvalidTypeException: Item subtype ${this.type} is unrecognized!`);
    }

    return factoryFunction(this);
  }
}
