import { ITEM_SUBTYPE } from './item-subtype.mjs';
import TransientAsset from "./transient-asset.mjs";
import TransientFateCard from "./transient-fate-card.mjs";
import TransientIllness from "./transient-illness.mjs";
import TransientInjury from "./transient-injury.mjs";
import TransientMutation from "./transient-mutation.mjs";
import TransientSkill from "./transient-skill.mjs";

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
  get defaultImg() { return this.getTransientObject().defaultImg; }

  /**
   * Chat message template path. 
   * @type {String}
   * @readonly
   */
  get chatMessageTemplate() { return this.getTransientObject().chatMessageTemplate; }

  /** @override */
  prepareData() {
    super.prepareData();

    this._invalidateTransientObject();
    this.getTransientObject().prepareData(this);
  }

  /**
   * Returns an instance of a specific type of transient object for this item. 
   * 
   * @returns {TransientBaseItem}
   */
  getTransientObject() {
    if (this._transientObject === undefined) {
      const factoryFunction = ITEM_SUBTYPE.get(this.type);
      
      if (factoryFunction === undefined) {
        throw new Error(`InvalidTypeException: Item subtype ${this.type} is unrecognized!`);
      }

      game.ambersteel.logger.logPerf(this, "item.getTransientObject (non-cached)", () => {
        this._transientObject = factoryFunction(this);
      });
    }
    return this._transientObject;
  }
  
  /**
   * Invalidates the cached transient object instance, causing a new one to be instantiated at the next access. 
   * 
   * @private
   */
  _invalidateTransientObject() {
    this._transientObject = undefined;
  }
}
