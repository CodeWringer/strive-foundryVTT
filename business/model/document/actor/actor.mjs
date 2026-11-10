import { common } from "../../../../common/_module.mjs";
import { ACTOR_TYPES } from "../../domain/const/actor-types.mjs";
import CharacterActorDocument from "./character-actor-document.mjs";
import PlainActorDocument from "./plain-actor-document.mjs";

/**
 * @summary
 * This class represents FoundryVTT's `Actor` document type. 
 * 
 * @description
 * In truth, this class only serves as a "data source" and should never be worked with 
 * directly. Instead, an instance of `AuthenticDocument` should be fetched via the 
 * `getEnhancedDocument`-method and used instead. 
 * 
 * @see AuthenticDocument
 */
export class GameSystemActor extends Actor {
  /**
   * Returns a map of `Actor` sub-types and their factory functions. 
   * 
   * @type {Map<String, Function>}
   * @static
   * @readonly
   * @private
   */
  static get SUB_TYPES() {
    return new Map([
      [ACTOR_TYPES.character, (document) => { return new CharacterActorDocument({ document: document }) }],
      [ACTOR_TYPES.plain, (document) => { return new PlainActorDocument({ document: document }) }],
    ]);
  }

  /**
   * Returns the default icon image path for this type of actor. 
   * @type {String}
   * @virtual
   * @readonly
   */
  get defaultImg() { return this.getEnhancedDocument().defaultImg; }

  /**
   * Chat message template path. 
   * @type {String}
   * @readonly
   */
  get chatMessageTemplate() { return this.getEnhancedDocument().chatMessageTemplate; }

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
    if (!common.util.validation.isDefined(this.#internalDocument)) {
      const factoryFunction = GameSystemActor.SUB_TYPES.get(this.type);
      
      if (factoryFunction === undefined) {
        throw new Error(`InvalidTypeException: Actor subtype ${this.type} is unrecognized!`);
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

  /** @override */
  getRollData() {
    const baseInitiative = this.getEnhancedDocument().baseInitiative;
    return {
      baseInitiative: baseInitiative,
    };
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