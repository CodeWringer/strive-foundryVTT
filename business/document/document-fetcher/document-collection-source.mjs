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
 * compendia and module compendia.
 * @property {DocumentCollectionSource} compendia Search only in compendia 
 * (world and system compendia).
 * @property {DocumentCollectionSource} world Search only in the world.
 * 
 * @constant
 */
export const DOCUMENT_COLLECTION_SOURCES = {
  all: new DocumentCollectionSource({
    id: 0,
    name: "all",
  }),
  compendia: new DocumentCollectionSource({
    id: 1,
    name: "compendia",
  }),
  world: new DocumentCollectionSource({
    id: 2,
    name: "world",
  }),
}