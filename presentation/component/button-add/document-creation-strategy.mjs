import { GENERAL_DOCUMENT_TYPES } from "../../../business/document/general-document-types.mjs";
import TransientBaseActor from "../../../business/document/actor/transient-base-actor.mjs";
import { ValidationUtil } from "../../../business/util/validation-utility.mjs";

/**
 * Represents a means of determining the creation data for a new 
 * document to be instantiated. 
 */
export default class DocumentCreationStrategy {
  /**
   * @param {Object} args 
   * @param {TransientBaseActor | undefined} args.target The Actor document instance on which 
   * to embed the new document instance. Note - this can only apply when `generalType` 
   * is of value `"Item"`! Otherwise, an error is thrown! 
   * @param {Object | undefined} args.creationDataOverrides Overrides applied to the selected 
   * creation data. Can be used to override a specific property, while leaving 
   * the others untouched. For example, to set a starting level for a skill Item. 
   */
  constructor(args = {}) {
    ValidationUtil.validateOrThrow(args, ["target"]);

    this.target = args.target;
    this.creationDataOverrides = args.creationDataOverrides ?? Object.create(null);
  }

  /**
   * Determines the creation data and unless the user could and has canceled, 
   * will create the document. 
   * 
   * @returns {Object} The created document. 
   * 
   * @abstract
   * @async
   */
  async selectAndCreate() {
    if (ValidationUtil.isDefined(this.target) && this.generalType === GENERAL_DOCUMENT_TYPES.ACTOR) {
      throw new Error("Actors can not ever be embedded");
    } else if (this._targetIsAnItem()) {
      throw new Error("Items can not be embedded on other Items.");
    }

    const creationData = await this._get();

    // If the creation data is undefined, then the user has canceled. 
    if (!ValidationUtil.isDefined(creationData)) return; // Bail out. 
    
    // Try to create the document. 
    if (this._targetIsAnActor() && this.generalType === GENERAL_DOCUMENT_TYPES.ITEM) {
      // Create embedded Item document. 
      return await Item.create(creationData, { parent: this.target.document }); 
    } else if (!ValidationUtil.isDefined(this.target) && this.generalType === GENERAL_DOCUMENT_TYPES.ITEM) {
      // Create world Item document. 
      return await Item.create(creationData, {}); 
    } else if (!ValidationUtil.isDefined(this.target) && this.generalType === GENERAL_DOCUMENT_TYPES.ACTOR) {
      // Create world Actor document. 
      return await Actor.create(creationData, {}); 
    } else {
      throw new Error("Failed to create document - bad configuration");
    }
  }
  
  /**
   * Returns `true`, if the `target` is an actor. 
   * 
   * @returns {Boolean}
   * 
   * @private
   */
  _targetIsAnActor() {
    if (ValidationUtil.isDefined(this.target)) {
      return this.target.document.documentName === GENERAL_DOCUMENT_TYPES.ACTOR;
    } else {
      return false;
    }
  }

  /**
   * Returns `true`, if the `target` is an item. 
   * 
   * @returns {Boolean}
   * 
   * @private
   */
  _targetIsAnItem() {
    if (ValidationUtil.isDefined(this.target)) {
      return this.target.document.documentName === GENERAL_DOCUMENT_TYPES.ITEM;
    } else {
      return false;
    }
  }
  
  /**
   * Gathers and returns the creation data. 
   * 
   * @returns {Object} 
   * 
   * @abstract
   * @async
   * @protected
   */
  async _get() {
    throw new Error("Not implemented");
  }
}
