import { DOCUMENT_COLLECTION_SOURCES } from "./document-collection-source.mjs";
import { DocumentIndex } from "./document-index.mjs";

/**
 * Allows fetching document metadata and instances from various sources. 
 */
export default class DocumentFetcher {
  /**
   * A list of all searchable world collections. 
   * 
   * @type {Array<Map<String, Object>>}
   * @private
   * @static
   * @readonly
   */
  static get WORLD_COLLECTIONS() { return [game.items, game.actors, game.journal, game.tables]; }


  /**
   * Returns all document indices that match the given filter parameters. 
   * 
   * Can search in a variety of sources, such as compendium packs or the world collections. 
   * 
   * @param {Object} filter 
   * @param {String | undefined} filter.documentType A document type. 
   * * E. g. `"Item"` or `"Actor"`
   * * If undefined, `contentType` **must** be defined. 
   * @param {String | undefined} filter.contentType A content type. 
   * * E. g. `"skill"` or `"npc"`
   * * If undefined, `documentType` **must** be defined. 
   * @param {DocumentCollectionSource | undefined} filter.source A document source to 
   * filter by. 
   * * Default `DOCUMENT_COLLECTION_SOURCES.all`.
   * 
   * @returns {Array<DocumentIndex>} 
   * 
   * @throws {Error} Thrown, if neither `documentType`, nor `contentType` are defined. 
   */
  getDocumentIndices(filter = {}) {
    if ((filter.documentType === undefined || filter.documentType === null) 
      && (filter.contentType === undefined || filter.contentType === null)) {
        throw new Error("InvalidArgumentException: Either `documentType` or `contentType` must be defined");
    }

    let result = [];

    const source = filter.source ?? DOCUMENT_COLLECTION_SOURCES.all; 

    // Search compendia
    if (source.id == DOCUMENT_COLLECTION_SOURCES.all.id || source.id == DOCUMENT_COLLECTION_SOURCES.compendia.id) {
      const indices = this._getDocumentIndicesInCompendia(filter);
      result = result.concat(indices);
    }

    // Search world
    if (source.id == DOCUMENT_COLLECTION_SOURCES.all.id || source.id == DOCUMENT_COLLECTION_SOURCES.world.id) {
      const indices = this._getDocumentIndicesInWorld(filter);
      result = result.concat(indices);
    }

    return result;
  }
  
  /**
   * Returns all document indices that match the given filter parameters. 
   * 
   * Searches in compendium packs. 
   * 
   * @param {Object} filter 
   * @param {String | undefined} filter.documentType A document type. 
   * * E. g. `"Item"` or `"Actor"`
   * * If undefined, `contentType` **must** be defined. 
   * @param {String | undefined} filter.contentType A content type. 
   * * E. g. `"skill"` or `"npc"`
   * * If undefined, `documentType` **must** be defined. 
   * 
   * @returns {Array<DocumentIndex>} 
   * 
   * @private
   */
  _getDocumentIndicesInCompendia(filter = {}) {
    const result = [];

    for (const pack of game.packs) {
      // Skip empty packs. 
      if (pack.index.size < 1) continue;

      // Skip, if the pack is of the wrong document type. 
      if (filter.documentType !== undefined 
        && pack.metadata.type.toLowerCase() != filter.documentType.toLowerCase()) {
        continue;
      }

      for (const index of pack.index) {
        // Skip, if the entry is of the wrong content type. 
        if (filter.contentType !== undefined 
          && index.type.toLowerCase() != filter.contentType.toLowerCase()) {
          continue;
        }

        result.push(new DocumentIndex({
          id: index._id,
          name: index.name,
          sourceType: DOCUMENT_COLLECTION_SOURCES.compendia,
          sourceName: pack.metadata.id,
        }));
      }
    }
    return result;
  }
  
  /**
   * Returns all document indices that match the given filter parameters. 
   * 
   * Searches in world collections. 
   * 
   * @param {Object} filter 
   * @param {String | undefined} filter.documentType A document type. 
   * * E. g. `"Item"` or `"Actor"`
   * * If undefined, `contentType` **must** be defined. 
   * @param {String | undefined} filter.contentType A content type. 
   * * E. g. `"skill"` or `"npc"`
   * * If undefined, `documentType` **must** be defined. 
   * 
   * @returns {Array<DocumentIndex>} 
   * 
   * @private
   */
  _getDocumentIndicesInWorld(filter = {}) {
    const result = [];

    for (const worldCollection of DocumentFetcher.WORLD_COLLECTIONS) {
      // Skip empty collection. 
      if (worldCollection.size < 1) continue;

      // Skip, if the collection is of the wrong document type. 
      if (filter.documentType !== undefined 
        && worldCollection.documentName.toLowerCase() != filter.documentType.toLowerCase()) {
        continue;
      }

      const entries = worldCollection.values();
      for (const entry of entries) {
        // Skip, if the entry is of the wrong content type. 
        if (filter.contentType !== undefined 
          && entry.type.toLowerCase() != filter.contentType.toLowerCase()) {
          continue;
        }

        result.push(new DocumentIndex({
          id: entry.id,
          name: entry.name,
          sourceType: DOCUMENT_COLLECTION_SOURCES.world,
          sourceName: worldCollection.name,
        }));
      }
    }
    return result;
  }

}

window.DocumentFetcher = DocumentFetcher;