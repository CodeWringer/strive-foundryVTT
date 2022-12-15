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
   * Returns a document that matches the given filter parameters. 
   * 
   * Can search in a variety of sources, such as compendium packs or the world collections. 
   * 
   * **WARNING**: This process can be very slow for large collections, as full document instances 
   * are loaded from the data base for **every** match. Make sure to filter as specifically, as 
   * possible! 
   * 
   * @param {Object} filter 
   * @param {String | undefined} filter.id The id of the document to fetch. 
   * * If undefined, `name` **must** be defined. 
   * * Takes precedence over `name`. 
   * @param {String | undefined} filter.name The name of the document to fetch. 
   * * If undefined, `id` **must** be defined. 
   * * If `id` is undefined, will pick the _first_ document whose name matches this. 
   * @param {String | undefined} filter.documentType A document type. 
   * * E. g. `"Item"` or `"Actor"`
   * @param {String | undefined} filter.contentType A content type. 
   * * E. g. `"skill"` or `"npc"`
   * @param {DocumentCollectionSource | undefined} filter.source A document source to 
   * filter by. 
   * * Default `DOCUMENT_COLLECTION_SOURCES.all`.
   * 
   * @returns {Document | undefined} 
   * 
   * @throws {Error} Thrown, if neither `id`, nor `name` are defined. 
   * 
   * @async
   */
  async findDocument(filter = {}) {
    if ((filter.id === undefined || filter.id === null) 
      && (filter.name === undefined || filter.name === null)) {
        throw new Error("InvalidArgumentException: Either `id` or `name` must be defined");
    }

    const source = filter.source ?? DOCUMENT_COLLECTION_SOURCES.all; 

    // Search compendia
    if (source.id == DOCUMENT_COLLECTION_SOURCES.all.id || source.id == DOCUMENT_COLLECTION_SOURCES.compendia.id) {
      const document = await this._findDocumentInCompendia(filter);
      if (document !== undefined) {
        return document;
      }
    }

    // Search world
    if (source.id == DOCUMENT_COLLECTION_SOURCES.all.id || source.id == DOCUMENT_COLLECTION_SOURCES.world.id) {
      const document = this._findDocumentInWorld(filter);
      if (document !== undefined) {
        return document;
      }
    }
  }

  /**
   * Returns a document that matches the given filter parameters. 
   * 
   * Searches in compendium packs. 
   * 
   * @param {Object} filter 
   * @param {String | undefined} filter.id The id of the document to fetch. 
   * @param {String | undefined} filter.name The name of the document to fetch. 
   * * If `id` is undefined, will pick the _first_ document whose name matches this. 
   * @param {String | undefined} filter.documentType A document type. 
   * * E. g. `"Item"` or `"Actor"`
   * @param {String | undefined} filter.contentType A content type. 
   * * E. g. `"skill"` or `"npc"`
   * 
   * @returns {Document | undefined} 
   * 
   * @private
   * @async
   */
  async _findDocumentInCompendia(filter = {}) {
    for (const pack of game.packs) {
      // Skip empty packs. 
      if (pack.index.size < 1) continue;

      // Skip, if the pack is of the wrong document type. 
      if (filter.documentType !== undefined 
        && pack.metadata.type.toLowerCase() != filter.documentType.toLowerCase()) {
        continue;
      }

      for (const index of pack.index) {
        const id = index._id;

        // Skip, if the entry is of the wrong content type. 
        if (filter.contentType !== undefined 
          && index.type.toLowerCase() != filter.contentType.toLowerCase()) {
          continue;
        }
        
        // Skip, if neither id nor name match. 
        if (filter.id !== undefined && filter.id !== id) continue;
        if (filter.name !== undefined && filter.name.toLowerCase() !== index.name.toLowerCase()) continue;

        // Get a loaded instance of the document from the data base. 
        return await pack.getDocument(id);
      }
    }
    return undefined;
  }

  /**
   * Returns a document that matches the given filter parameters. 
   * 
   * Searches in the world. 
   * 
   * @param {Object} filter 
   * @param {String | undefined} filter.id The id of the document to fetch. 
   * @param {String | undefined} filter.name The name of the document to fetch. 
   * * If `id` is undefined, will pick the _first_ document whose name matches this. 
   * @param {String | undefined} filter.documentType A document type. 
   * * E. g. `"Item"` or `"Actor"`
   * @param {String | undefined} filter.contentType A content type. 
   * * E. g. `"skill"` or `"npc"`
   * 
   * @returns {Document | undefined} 
   * 
   * @private
   */
  _findDocumentInWorld(filter = {}) {
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

        // Skip, if neither id nor name match. 
        if (filter.id !== undefined && filter.id !== entry.id) continue;
        if (filter.name !== undefined && filter.name.toLowerCase() !== entry.name.toLowerCase()) continue;

        return entry;
      }
    }
    return undefined;
  }

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