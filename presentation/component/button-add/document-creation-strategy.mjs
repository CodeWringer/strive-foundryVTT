import { GENERAL_DOCUMENT_TYPES } from "../../../business/document/general-document-types.mjs";
import TransientBaseActor from "../../../business/document/actor/transient-base-actor.mjs";
import { ValidationUtil } from "../../../business/util/validation-utility.mjs";
import { ACTOR_TYPES } from "../../../business/document/actor/actor-types.mjs";

/**
 * Represents a means of determining the creation data for a new 
 * document to be instantiated. 
 */
export default class DocumentCreationStrategy {
  /**
   * @param {Object} args 
   * @param {TransientBaseActor | undefined} args.target The Actor document instance on which 
   * to embed the new document instance. Note it is only possible to nest Items in Actors. 
   * @param {Object | undefined} args.creationDataOverrides Overrides applied to the selected 
   * creation data. Can be used to override a specific property, while leaving 
   * the others untouched. For example, to set a starting level for a skill Item. 
   */
  constructor(args = {}) {
    ValidationUtil.validateOrThrow(args, ["target"]);

    this.target = args.target;
    this.creationDataOverrides = args.creationDataOverrides;
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
    if (this._targetIsAnItem()) {
      throw new Error("Documents can not be embedded in Items.");
    }

    let creationData = await this._getCreationData();
    // If the creation data is undefined, then the user has canceled. 
    if (!ValidationUtil.isDefined(creationData)) return; // Bail out. 
    
    // Apply overrides. 
    creationData = foundry.utils.mergeObject(creationData, this.creationDataOverrides);

    const creationDataIsActor = this._getIsTypeAnActor(creationData.type);
    
    // Try to create the document. 
    if (this._targetIsAnActor() && creationDataIsActor === false) {
      // Create embedded Item document. 
      return await Item.create(creationData, { parent: this.target.document }); 
    } else if (!ValidationUtil.isDefined(this.target) && creationDataIsActor === false) {
      // Create world Item document. 
      return await Item.create(creationData, {}); 
    } else if (!ValidationUtil.isDefined(this.target) && creationDataIsActor === true) {
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
  async _getCreationData() {
    throw new Error("Not implemented");
  }

  /**
   * Returns `true`, if the given type represents an actor. 
   * 
   * @param {String} type 
   * 
   * @returns {Boolean} `true`, if the given type represents an actor. 
   * 
   * @protected
   */
  _getIsTypeAnActor(type) {
    return type === ACTOR_TYPES.NPC 
      || type === ACTOR_TYPES.PC
      || type === ACTOR_TYPES.PLAIN;
  }
}
