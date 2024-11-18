import { ValidationUtil } from "../../util/validation-utility.mjs";
import { DOCUMENT_COLLECTION_SOURCES, DocumentCollectionSource } from "./document-collection-source.mjs";
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
   * May also look for embedded documents.
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
   * @param {ITEM_TYPES | String | undefined} filter.contentType A content type. 
   * * E. g. `"skill"` or `"npc"`
   * @param {DocumentCollectionSource | undefined} filter.source A document source to 
   * filter by. 
   * * Default `DOCUMENT_COLLECTION_SOURCES.all`.
   * @param {Boolean | undefined} filter.searchEmbedded If `true`, will also look for embedded 
   * documents. 
   * * Default `false`. 
   * * Note, that this setting may slow searches down, **significantly**. 
   * @param {Boolean | undefined} filter.includeLocked If `true`, will also search in locked 
   * copendium packs. 
   * * Only relevant, if compendium packs are searched. 
   * * Default `true`.
   * 
   * @returns {Document | undefined} 
   * 
   * @throws {Error} Thrown, if neither `id`, nor `name` are defined. 
   * 
   * @async
   */
  async find(filter = {}) {
    if ((filter.id === undefined || filter.id === null) 
      && (filter.name === undefined || filter.name === null)) {
        throw new Error("InvalidArgumentException: Either `id` or `name` must be defined");
    }

    filter = this._fixupFilter(filter);

    // Search compendia
    if (this._shouldSearchCompendia(filter) === true) {
      const document = await this._findInCompendia(filter);
      if (document !== undefined) {
        return document;
      }
    }

    // Search world
    if (this._shouldSearchWorld(filter) === true) {
      const document = this._findInWorld(filter);
      if (document !== undefined) {
        return document;
      }
    }
    return undefined;
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
   * @param {ITEM_TYPES | String | undefined} filter.contentType A content type. 
   * * E. g. `"skill"` or `"npc"`
   * @param {Boolean | undefined} filter.searchEmbedded If `true`, will also look for embedded 
   * documents. 
   * * Default `false`. 
   * * Note, that this setting may slow searches down, **significantly**. 
   * @param {DocumentCollectionSource} filter.source A document source to 
   * filter by. 
   * @param {Boolean | undefined} filter.includeLocked If `true`, will also search in locked 
   * copendium packs. 
   * * Only relevant, if compendium packs are searched. 
   * * Default `true`.
   * 
   * @returns {Document | undefined} 
   * 
   * @private
   * @async
   */
  async _findInCompendia(filter = {}) {
    ValidationUtil.validateOrThrow(filter, ["source"]);

    for (const pack of game.packs) {
      // Skip empty packs. 
      if (pack.index.size < 1) continue;

      // Skip, if the pack represents the wrong source.
      if (this._packSourceFilterMatches(filter, pack) !== true) continue;

      // The document type of the pack. E. g. `"Actor"`. 
      const packDocumentType = pack.metadata.type.toLowerCase();

      // Look through embedded documents, if desired. 
      // This loop is expected to be SLOW.
      if (filter.searchEmbedded === true && packDocumentType == "actor") {
        for (const index of pack.index) {
          const id = index._id;
          const actor = await pack.getDocument(id);

          let document = actor.items.find(it => (it.id ?? it._id) === filter.id);
          if (document == undefined) {
            document = actor.items.find(it => it.name === filter.name);
          }
          if (document !== undefined) {
            return document;
          }
        }
      }

      // Skip, if the pack is of the wrong document type. 
      // This skip must happen _after_ the embedded document search. Even if the current 
      // search does not target actor type packs, those actors could still contain 
      // the targeted document instance. 
      if (filter.documentType !== undefined 
        && packDocumentType !== filter.documentType) {
        continue;
      }

      for (const index of pack.index) {
        const id = index._id;

        // Skip, if the entry is of the wrong content type. 
        if (filter.contentType !== undefined 
          && index.type.toLowerCase() !== filter.contentType) {
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
   * @param {ITEM_TYPES | String | undefined} filter.contentType A content type. 
   * * E. g. `"skill"` or `"npc"`
   * @param {Boolean | undefined} filter.searchEmbedded If `true`, will also look for embedded 
   * documents. 
   * * Default `false`. 
   * * Note, that this setting may slow searches down, **significantly**. 
   * 
   * @returns {Document | undefined} 
   * 
   * @private
   */
  _findInWorld(filter = {}) {
    for (const worldCollection of DocumentFetcher.WORLD_COLLECTIONS) {
      // Skip empty collection. 
      if (worldCollection.size < 1) continue;

      // The document type of the collection. E. g. `"Actor"`. 
      const collectionDocumentType = worldCollection.documentName.toLowerCase();

      // Look through embedded documents, if desired. 
      // This loop is expected to be SLOW.
      if (filter.searchEmbedded === true && collectionDocumentType == "actor") {
        for (const actor of worldCollection) {
          let document = actor.items.find(it => (it.id ?? it._id) === filter.id);
          if (document == undefined) {
            document = actor.items.find(it => it.name === filter.name);
          }
          if (document !== undefined) {
            return document;
          }
        }
      }

      // Skip, if the collection is of the wrong document type. 
      if (filter.documentType !== undefined 
        && collectionDocumentType != filter.documentType) {
        continue;
      }

      const entries = worldCollection.values();
      for (const entry of entries) {
        // Skip, if the entry is of the wrong content type. 
        if (filter.contentType !== undefined 
          && entry.type.toLowerCase() != filter.contentType) {
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
   * Returns all documents that matches the given filter parameters. 
   * 
   * Can search in a variety of sources, such as compendium packs or the world collections. 
   * 
   * May also look for embedded documents.
   * 
   * **WARNING**: This process can be very slow for large collections, as full document instances 
   * are loaded from the data base for **every** match. Make sure to filter as specifically, as 
   * possible! 
   * 
   * @param {Object} filter 
   * @param {String | undefined} filter.id The id of the documents to fetch. 
   * @param {String | undefined} filter.name The name of the documents to fetch. 
   * @param {String | undefined} filter.documentType A document type. 
   * * E. g. `"Item"` or `"Actor"`
   * @param {ITEM_TYPES | String | undefined} filter.contentType A content type. 
   * * E. g. `"skill"` or `"npc"`
   * @param {DocumentCollectionSource | undefined} filter.source A document source to 
   * filter by. 
   * * Default `DOCUMENT_COLLECTION_SOURCES.all`.
   * @param {Boolean | undefined} filter.searchEmbedded If `true`, will also look for embedded 
   * documents. 
   * * Default `false`. 
   * * Note, that this setting may slow searches down, **significantly**. 
   * @param {Boolean | undefined} filter.includeLocked If `true`, will also search in locked 
   * copendium packs. 
   * * Only relevant, if compendium packs are searched. 
   * * Default `true`.
   * 
   * @returns {Array<Document>} 
   * 
   * @async
   */
  async findAll(filter = {}) {
    let result = [];

    filter = this._fixupFilter(filter);

    // Search compendia
    if (this._shouldSearchCompendia(filter) === true) {
      const documents = await this._findAllInCompendia(filter);
      result = result.concat(documents);
    }

    // Search world
    if (this._shouldSearchWorld(filter) === true) {
      const documents = this._findAllInWorld(filter);
      result = result.concat(documents);
    }

    return result;
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
   * @param {ITEM_TYPES | String | undefined} filter.contentType A content type. 
   * * E. g. `"skill"` or `"npc"`
   * @param {Boolean | undefined} filter.searchEmbedded If `true`, will also look for embedded 
   * documents. 
   * * Default `false`. 
   * * Note, that this setting may slow searches down, **significantly**. 
   * @param {DocumentCollectionSource} filter.source A document source to 
   * filter by. 
   * @param {Boolean | undefined} filter.includeLocked If `true`, will also search in locked 
   * copendium packs. 
   * * Only relevant, if compendium packs are searched. 
   * * Default `true`.
   * 
   * @returns {Array<Document> | undefined} 
   * 
   * @private
   * @async
   */
  async _findAllInCompendia(filter = {}) {
    ValidationUtil.validateOrThrow(filter, ["source"]);

    let result = [];

    for (const pack of game.packs) {
      // Skip empty packs. 
      if (pack.index.size < 1) continue;

      // Skip, if the pack represents the wrong source.
      if (this._packSourceFilterMatches(filter, pack) !== true) continue;

      // The document type of the pack. E. g. `"Actor"`. 
      const packDocumentType = pack.metadata.type.toLowerCase();

      // Look through embedded documents, if desired. 
      // This loop is expected to be SLOW.
      if (filter.searchEmbedded === true && packDocumentType == "actor") {
        for (const index of pack.index) {
          const id = index._id;
          const actor = await pack.getDocument(id);

          const documents = actor.items.filter(it => (it.id ?? it._id) === filter.id 
            || it.name === filter.name 
            || it.type.toLowerCase() === filter.contentType
          );
          result = result.concat(documents);
        }
      }

      // Skip, if the pack is of the wrong document type. 
      // This skip must happen _after_ the embedded document search. Even if the current 
      // search does not target actor type packs, those actors could still contain 
      // the targeted document(s). 
      if (filter.documentType !== undefined 
        && packDocumentType !== filter.documentType) {
        continue;
      }

      for (const index of pack.index) {
        const id = index._id;

        // Skip, if the entry is of the wrong content type. 
        if (filter.contentType !== undefined 
          && index.type.toLowerCase() !== filter.contentType) {
          continue;
        }
        
        // Skip, if neither id nor name match. 
        if (filter.id !== undefined && filter.id !== id) continue;
        if (filter.name !== undefined && filter.name.toLowerCase() !== index.name.toLowerCase()) continue;

        // Get a loaded instance of the document from the data base. 
        const document = await pack.getDocument(id);
        result.push(document);
      }
    }
    return result;
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
   * @param {ITEM_TYPES | String | undefined} filter.contentType A content type. 
   * * E. g. `"skill"` or `"npc"`
   * @param {Boolean | undefined} filter.searchEmbedded If `true`, will also look for embedded 
   * documents. 
   * * Default `false`. 
   * * Note, that this setting may slow searches down, **significantly**. 
   * 
   * @returns {Array<Document> | undefined} 
   * 
   * @private
   */
  _findAllInWorld(filter = {}) {
    let result = [];

    for (const worldCollection of DocumentFetcher.WORLD_COLLECTIONS) {
      // Skip empty collection. 
      if (worldCollection.size < 1) continue;

      // The document type of the collection. E. g. `"Actor"`. 
      const collectionDocumentType = worldCollection.documentName.toLowerCase();

      // Look through embedded documents, if desired. 
      // This loop is expected to be SLOW.
      if (filter.searchEmbedded === true && collectionDocumentType == "actor") {
        for (const actor of worldCollection) {
          const documents = actor.items.filter(it => (it.id ?? it._id) === filter.id 
            || it.name === filter.name 
            || it.type.toLowerCase() === filter.contentType
          );
          result = result.concat(documents);
        }
      }

      // Skip, if the collection is of the wrong document type. 
      if (filter.documentType !== undefined 
        && collectionDocumentType !== filter.documentType) {
        continue;
      }

      const entries = worldCollection.values();
      for (const entry of entries) {
        // Skip, if the entry is of the wrong content type. 
        if (filter.contentType !== undefined 
          && entry.type.toLowerCase() != filter.contentType) {
          continue;
        }

        // Skip, if neither id nor name match. 
        if (filter.id !== undefined && filter.id !== entry.id) continue;
        if (filter.name !== undefined && filter.name.toLowerCase() !== entry.name.toLowerCase()) continue;

        result.push(entry);
      }
    }
    return result;
  }

  /**
   * Returns all document indices that match the given filter parameters. 
   * 
   * Can search in a variety of sources, such as compendium packs or the world collections. 
   * 
   * @param {Object} filter 
   * @param {GENERAL_DOCUMENT_TYPES | String | undefined} filter.documentType A document type. 
   * * E. g. `"Item"` or `"Actor"`
   * * If undefined, `contentType` **must** be defined. 
   * @param {ITEM_TYPES | String | undefined} filter.contentType A content type. 
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
  getIndices(filter = {}) {
    if ((filter.documentType === undefined || filter.documentType === null) 
      && (filter.contentType === undefined || filter.contentType === null)) {
        throw new Error("InvalidArgumentException: Either `documentType` or `contentType` must be defined");
    }

    let result = [];

    filter = this._fixupFilter(filter);

    // Search compendia
    if (this._shouldSearchCompendia(filter)) {
      const indices = this._getIndicesInCompendia(filter);
      result = result.concat(indices);
    }

    // Search world
    if (this._shouldSearchWorld(filter)) {
      const indices = this._getIndicesInWorld(filter);
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
   * @param {ITEM_TYPES | String | undefined} filter.contentType A content type. 
   * * E. g. `"skill"` or `"npc"`
   * * If undefined, `documentType` **must** be defined. 
   * @param {DocumentCollectionSource | undefined} filter.source A document source to 
   * filter by. 
   * @param {Boolean | undefined} filter.includeLocked If `true`, will also search in locked 
   * copendium packs. 
   * * Only relevant, if compendium packs are searched. 
   * * Default `true`.
   * 
   * @returns {Array<DocumentIndex>} 
   * 
   * @throws {Error} Thrown, if an unknown compendium pack source is identified. 
   * 
   * @private
   */
  _getIndicesInCompendia(filter = {}) {
    const result = [];

    for (const pack of game.packs) {
      // Skip empty packs. 
      if (pack.index.size < 1) continue;

      // Skip, if the pack represents the wrong source.
      if (this._packSourceFilterMatches(filter, pack) !== true) continue;

      // Skip, if the pack is of the wrong document type. 
      if (filter.documentType !== undefined 
        && pack.metadata.type.toLowerCase() != filter.documentType) {
        continue;
      }

      const packType = pack.metadata.packageType.toLowerCase();
      let sourceType = undefined;
      if (packType === "system") {
        sourceType = DOCUMENT_COLLECTION_SOURCES.systemCompendia;
      } else if (packType === "world") {
        sourceType = DOCUMENT_COLLECTION_SOURCES.worldCompendia;
      }

      for (const index of pack.index) {
        // Skip, if the entry is of the wrong content type. 
        if (ValidationUtil.isDefined(filter.contentType) 
          && index.type.toLowerCase() != filter.contentType) {
          continue;
        }

        result.push(new DocumentIndex({
          id: index._id,
          name: index.name,
          sourceType: sourceType,
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
   * @param {ITEM_TYPES | String | undefined} filter.contentType A content type. 
   * * E. g. `"skill"` or `"npc"`
   * * If undefined, `documentType` **must** be defined. 
   * 
   * @returns {Array<DocumentIndex>} 
   * 
   * @private
   */
  _getIndicesInWorld(filter = {}) {
    const result = [];

    for (const worldCollection of DocumentFetcher.WORLD_COLLECTIONS) {
      // Skip empty collection. 
      if (worldCollection.size < 1) continue;

      // Skip, if the collection is of the wrong document type. 
      if (filter.documentType !== undefined 
        && worldCollection.documentName.toLowerCase() != filter.documentType) {
        continue;
      }

      const entries = worldCollection.values();
      for (const entry of entries) {
        // Skip, if the entry is of the wrong content type. 
        if (filter.contentType !== undefined 
          && entry.type.toLowerCase() != filter.contentType) {
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

  /**
   * Fixes up the given filter object, by ensuring required properties are set 
   * and that the values can be worked with, easily. 
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
   * @param {ITEM_TYPES | String | undefined} filter.contentType A content type. 
   * * E. g. `"skill"` or `"npc"`
   * @param {DocumentCollectionSource | undefined} filter.source A document source to 
   * filter by. 
   * * Default `DOCUMENT_COLLECTION_SOURCES.all`.
   * @param {Boolean | undefined} filter.searchEmbedded If `true`, will also look for embedded 
   * documents. 
   * * Default `false`. 
   * * Note, that this setting may slow searches down, **significantly**. 
   * @param {Boolean | undefined} filter.includeLocked If `true`, will also search in locked 
   * copendium packs. 
   * * Only relevant, if compendium packs are searched. 
   * * Default `true`.
   * 
   * @returns {Object} 
   * 
   * @private
   */
  _fixupFilter(filter) {
    filter.source = filter.source ?? DOCUMENT_COLLECTION_SOURCES.all; 
    filter.includeLocked = filter.includeLocked ?? true;

    // Convert the type string to lowercase, for easier comparisons. 
    if (filter.documentType !== undefined) {
      filter.documentType = filter.documentType.toLowerCase();
    }
    if (filter.contentType !== undefined) {
      filter.contentType = filter.contentType.toLowerCase();
    }

    filter.searchEmbedded = filter.searchEmbedded ?? false;

    return filter;
  }

  /**
   * Returns true, if the given filter indicates that compendium packs 
   * should be searched. 
   * 
   * @param {Object} filter 
   * @param {DocumentCollectionSource | undefined} filter.source A document source to 
   * filter by. 
   * 
   * @returns {Boolean} True, if the given filter indicates that compendium packs 
   * should be searched. 
   * 
   * @private
   */
  _shouldSearchCompendia(filter) {
    const sourceId = filter.source.id;
    if (sourceId == DOCUMENT_COLLECTION_SOURCES.all.id
      || sourceId == DOCUMENT_COLLECTION_SOURCES.allCompendia.id
      || sourceId == DOCUMENT_COLLECTION_SOURCES.systemCompendia.id
      || sourceId == DOCUMENT_COLLECTION_SOURCES.worldCompendia.id
      ) {
      return true;
    }
    return false;
  }

  /**
   * Returns true, if the given filter indicates that the world 
   * should be searched. 
   * 
   * @param {Object} filter 
   * @param {DocumentCollectionSource | undefined} filter.source A document source to 
   * filter by. 
   * 
   * @returns {Boolean} True, if the given filter indicates that the world 
   * should be searched. 
   * 
   * @private
   */
  _shouldSearchWorld(filter) {
    const sourceId = filter.source.id;
    if (sourceId == DOCUMENT_COLLECTION_SOURCES.all.id 
      || sourceId == DOCUMENT_COLLECTION_SOURCES.world.id
    ) {
      return true;
    }
    return false;
  }

  /**
   * Returns true, if the given pack matches the source in the given filter. 
   * 
   * @param {Object} filter 
   * @param {DocumentCollectionSource} filter.source A document source to 
   * filter by. 
   * @param {Object} pack A compendium pack to test. 
   * 
   * @returns {Boolean} True, if the given pack matches the source in the given filter. 
   * 
   * @private
   */
  _packSourceFilterMatches(filter, pack) {
    const type = pack.metadata.packageType.toLowerCase();

    if (filter.source.id === DOCUMENT_COLLECTION_SOURCES.systemCompendia.id 
      && (type === "system") !== true
    ) {
      return false;
    } else if (filter.source.id === DOCUMENT_COLLECTION_SOURCES.worldCompendia.id 
      && (type === "world") !== true
    ) {
      return false;
    } else if (filter.source.id === DOCUMENT_COLLECTION_SOURCES.world.id) {
      return false;
    } else if (filter.includeLocked !== true && pack.locked === true) {
      return false;
    }
    return true;
  }
}
