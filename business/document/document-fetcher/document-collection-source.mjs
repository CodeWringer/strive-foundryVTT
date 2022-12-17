/**
 * Represents a document collection source. 
 * 
 * @property {Number} id Unique number-based id. 
 * @property {String} name Internal name. 
 */
export class DocumentCollectionSource {
  constructor(args = {}) {
    this.id = args.id;
    this.name = args.name;
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
 * @property {DocumentCollectionSource} worldCompendia Search only in world 
 * compendium packs.
 * @property {DocumentCollectionSource} world Search only in the world.
 * 
 * @constant
 */
export const DOCUMENT_COLLECTION_SOURCES = {
  all: new DocumentCollectionSource({
    id: 0,
    name: "all",
  }),
  allCompendia: new DocumentCollectionSource({
    id: 1,
    name: "allCompendia",
  }),
  systemCompendia: new DocumentCollectionSource({
    id: 2,
    name: "systemCompendia",
  }),
  worldCompendia: new DocumentCollectionSource({
    id: 3,
    name: "worldCompendia",
  }),
  world: new DocumentCollectionSource({
    id: 4,
    name: "world",
  }),
}