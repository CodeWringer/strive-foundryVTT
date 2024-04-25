import { ITEM_TYPES } from "./item-types.mjs";
import TransientSkill from "./skill/transient-skill.mjs";
import TransientAsset from "./transient-asset.mjs";
import TransientFateCard from "./transient-fate-card.mjs";
import TransientIllness from "./transient-illness.mjs";
import TransientInjury from "./transient-injury.mjs";
import TransientMutation from "./transient-mutation.mjs";
import TransientScar from "./transient-scar.mjs";

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
export class GameSystemItem extends Item {
  /**
   * Returns a map of `Item` sub-types and their factory functions. 
   * 
   * @type {Map<String, Function<TransientBaseActor>>}
   * @static
   * @readonly
   * @private
   */
  static get SUB_TYPES() {
    const r = new Map();
    r.set(ITEM_TYPES.ASSET, (document) => { return new TransientAsset(document) });
    r.set(ITEM_TYPES.FATE_CARD, (document) => { return new TransientFateCard(document) });
    r.set(ITEM_TYPES.ILLNESS, (document) => { return new TransientIllness(document) });
    r.set(ITEM_TYPES.INJURY, (document) => { return new TransientInjury(document) });
    r.set(ITEM_TYPES.MUTATION, (document) => { return new TransientMutation(document) });
    r.set(ITEM_TYPES.SCAR, (document) => { return new TransientScar(document) });
    r.set(ITEM_TYPES.SKILL, (document) => { return new TransientSkill(document) });
    return r;
  }

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
      const factoryFunction = GameSystemItem.SUB_TYPES.get(this.type);
      
      if (factoryFunction === undefined) {
        throw new Error(`InvalidTypeException: Item subtype ${this.type} is unrecognized!`);
      }

      game.strive.logger.logPerf(this, "item.getTransientObject (non-cached)", () => {
        this._transientObject = factoryFunction(this);
      });
    }
    return this._transientObject;
  }

  /** @override */
  async _preCreate(data, options, user) {
    this.updateSource({
      img: this.defaultImg,
    });

    return super._preCreate(data, options, user);
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
