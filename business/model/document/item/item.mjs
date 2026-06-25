import { ITEM_TYPES } from "../../domain/const/item-types.mjs";
import TransientBaseItem from "./transient-base-item.mjs";
import TransientAsset from "./transient-asset.mjs";
import TransientFateCard from "./transient-fate-card.mjs";
import TransientHealthCondition from "./transient-health-condition.mjs";
import TransientIllness from "./transient-illness.mjs";
import TransientInjury from "./transient-injury.mjs";
import TransientLanguage from "./transient-language.mjs";
import TransientMutation from "./transient-mutation.mjs";
import TransientProject from "./transient-project.mjs";
import TransientRecipe from "./transient-recipe.mjs";
import TransientSkill from "./transient-skill.mjs";
import TransientTrait from "./transient-trait.mjs";

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
    return new Map([
      [ITEM_TYPES.asset, (document) => { return new TransientAsset(document) }],
      [ITEM_TYPES.fate_card, (document) => { return new TransientFateCard(document) }],
      [ITEM_TYPES.health_condition, (document) => { return new TransientHealthCondition(document) }],
      [ITEM_TYPES.illness, (document) => { return new TransientIllness(document) }],
      [ITEM_TYPES.injury, (document) => { return new TransientInjury(document) }],
      [ITEM_TYPES.language, (document) => { return new TransientLanguage(document) }],
      [ITEM_TYPES.mutation, (document) => { return new TransientMutation(document) }],
      [ITEM_TYPES.project, (document) => { return new TransientProject(document) }],
      [ITEM_TYPES.recipe, (document) => { return new TransientRecipe(document) }],
      [ITEM_TYPES.skill, (document) => { return new TransientSkill(document) }],
      [ITEM_TYPES.trait, (document) => { return new TransientTrait(document) }],
    ]);
  }

  /**
   * Returns the default icon image path for this type of object. 
   * @type {String}
   * @virtual
   * @readonly
   */
  get defaultImg() { return this.getTransientObject().defaultImg; }

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

      this._transientObject = factoryFunction(this);
    }
    return this._transientObject.getTransientObject();
  }

  /** @override */
  async _preCreate(data, options, user) {
    this.updateSource({
      img: data.img ?? this.defaultImg,
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
