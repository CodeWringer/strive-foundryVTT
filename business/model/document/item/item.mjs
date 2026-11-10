import { ITEM_TYPES } from "../../domain/const/item-types.mjs";
import AssetDocument from "./asset-document.mjs";
import FateCardDocument from "./fate-card-document.mjs";
import HealthConditionDocument from "./health-condition-document.mjs";
import IllnessDocument from "./illness-document.mjs";
import InjuryDocument from "./injury-document.mjs";
import LanguageDocument from "./language-document.mjs";
import MutationDocument from "./mutation-document.mjs";
import ProjectDocument from "./project-document.mjs";
import RecipeDocument from "./recipe-document.mjs";
import SkillDocument from "./skill-document.mjs";
import TraitDocument from "./trait-document.mjs";
import { ValidationUtil } from "../../../../common/util/validation-utility.mjs";
import AuthenticDocument from "../authentic-document.mjs";

/**
 * @summary
 * This class represents FoundryVTT's `Item` document type. 
 * 
 * @description
 * In truth, this class only serves as a "data source" and should never be worked with 
 * directly. Instead, an instance of `AuthenticDocument` should be fetched via the 
 * `getEnhancedDocument`-method and used instead. 
 * 
 * @see AuthenticDocument
 */
export class GameSystemItem extends Item {
  /**
   * Returns a map of `Item` sub-types and their factory functions. 
   * 
   * @type {Map<String, Function>}
   * @static
   * @readonly
   * @private
   */
  static get SUB_TYPES() {
    return new Map([
      [ITEM_TYPES.asset, (document) => { return new AssetDocument({ document: document }) }],
      [ITEM_TYPES.fate_card, (document) => { return new FateCardDocument({ document: document }) }],
      [ITEM_TYPES.health_condition, (document) => { return new HealthConditionDocument({ document: document }) }],
      [ITEM_TYPES.illness, (document) => { return new IllnessDocument({ document: document }) }],
      [ITEM_TYPES.injury, (document) => { return new InjuryDocument({ document: document }) }],
      [ITEM_TYPES.language, (document) => { return new LanguageDocument({ document: document }) }],
      [ITEM_TYPES.mutation, (document) => { return new MutationDocument({ document: document }) }],
      [ITEM_TYPES.project, (document) => { return new ProjectDocument({ document: document }) }],
      [ITEM_TYPES.recipe, (document) => { return new RecipeDocument({ document: document }) }],
      [ITEM_TYPES.skill, (document) => { return new SkillDocument({ document: document }) }],
      [ITEM_TYPES.trait, (document) => { return new TraitDocument({ document: document }) }],
    ]);
  }

  /**
   * Returns the default icon image path for this type of object. 
   * @type {String}
   * @virtual
   * @readonly
   */
  get defaultImg() { return this.getEnhancedDocument().defaultImg; }

  /**
   * @type {AuthenticDocument | undefined}
   * @private
   */
  #internalDocument;

  /** @override */
  prepareData() {
    super.prepareData();

    this.#invalidateDocument();
  }

  /**
   * Returns the enhanced document data instance. 
   * 
   * @returns {AuthenticDocument}
   */
  getEnhancedDocument() {
    if (!ValidationUtil.isDefined(this.#internalDocument)) {
      const factoryFunction = GameSystemItem.SUB_TYPES.get(this.type);
      
      if (factoryFunction === undefined) {
        throw new Error(`InvalidTypeException: Item subtype ${this.type} is unrecognized!`);
      }

      this.#internalDocument = factoryFunction(this);
    }
    return this.#internalDocument.getEnhancedDocument();
  }

  /** @override */
  async _preCreate(data, options, user) {
    this.updateSource({
      img: data.img ?? this.defaultImg,
    });

    return super._preCreate(data, options, user);
  }
  
  /**
   * Invalidates the cached enhanced document data instance, causing a new one to be re-instantiated at next access. 
   * 
   * @private
   */
  #invalidateDocument() {
    this.#internalDocument = undefined;
  }
}
