import { ConstantsUtil } from "../../util/constants-utility.mjs";
import { ValidationUtil } from "../../util/validation-utility.mjs";

/**
 * Represents a document collection source. 
 * 
 * @property {String} name Internal name. 
 * @property {String | undefined} localizableName Localization key. 
*/
export class DocumentCollectionSource {
  /**
   * @param {Object} args 
   * @property {String} args.name Internal name. 
   * @property {String | undefined} args.localizableName Localization key. 
   */
  constructor(args = {}) {
    ValidationUtil.validateOrThrow(args, ["name"]);
    this.name = args.name;
    this.localizableName = args.localizableName;
  }
}

/**
 * Represents the defined document collection sources. 
 * 
 * @property {DocumentCollectionSource} all Search in the world, the world and system 
 * compendium packs and in module compendium packs.
 * @property {DocumentCollectionSource} allCompendia Search in all 
 * compendium packs.
 * @property {DocumentCollectionSource} systemCompendia Search only in system 
 * compendium packs.
 * @property {DocumentCollectionSource} moduleCompendia Search only in module 
 * compendium packs.
 * @property {DocumentCollectionSource} systemAndModuleCompendia Search in system and module 
 * compendium packs.
 * @property {DocumentCollectionSource} worldCompendia Search only in world 
 * compendium packs.
 * @property {DocumentCollectionSource} world Search only in the world.
 * 
 * @constant
 */
export const DOCUMENT_COLLECTION_SOURCES = {
  all: new DocumentCollectionSource({
    name: "all",
    localizableName: "system.general.collectionSources.all"
  }),
  allCompendia: new DocumentCollectionSource({
    name: "allCompendia",
    localizableName: "system.general.collectionSources.allCompendia"
  }),
  systemCompendia: new DocumentCollectionSource({
    name: "systemCompendia",
    localizableName: "system.general.collectionSources.systemCompendia"
  }),
  moduleCompendia: new DocumentCollectionSource({
    name: "moduleCompendia",
    localizableName: "system.general.collectionSources.moduleCompendia"
  }),
  systemAndModuleCompendia: new DocumentCollectionSource({
    name: "systemAndModuleCompendia",
    localizableName: "system.general.collectionSources.systemAndModuleCompendia"
  }),
  worldCompendia: new DocumentCollectionSource({
    name: "worldCompendia",
    localizableName: "system.general.collectionSources.worldCompendia"
  }),
  world: new DocumentCollectionSource({
    name: "world",
    localizableName: "system.general.collectionSources.world"
  }),
}
ConstantsUtil.enrichConstant(DOCUMENT_COLLECTION_SOURCES);
