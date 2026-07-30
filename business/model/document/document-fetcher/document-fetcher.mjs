import { common } from "../../../../common/_module.mjs";
import { ValidationUtil } from "../../../../common/util/validation-utility.mjs";
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
   * @param {String | undefined} filter.sourcePackId ID of a specific compendium pack to search in. 
   * @param {Boolean | undefined} filter.searchEmbedded If `true`, will also look for embedded 
   * documents. 
   * * Default `false`. 
   * * Note, that this setting may slow searches down, **significantly**. 
   * @param {Boolean | undefined} filter.includeLocked If `true`, will also search in locked 
   * copendium packs. 
   * * Only relevant, if compendium packs are searched. 
   * * Default `true`.
   * 
   * @returns {Promise<Document | null>} 
   * 
   * @throws {Error} Thrown, if neither `id`, nor `name` are defined. 
   * 
   * @async
   */
  async find(filter = {}) {
    if (!common.util.validation.isDefined(filter.id) && !common.util.validation.isDefined(filter.name)) {
      throw new Error("InvalidArgumentException: Either `id` or `name` must be defined");
    }

    filter = this._fixupFilter(filter);

    // Search compendia
    if (this._shouldSearchCompendia(filter) === true) {
      const document = await this._findInCompendia(filter);
      if (ValidationUtil.isDefined(document)) {
        return document;
      }
    }

    // Search world
    if (this._shouldSearchWorld(filter) === true) {
      const document = this._findInWorld(filter);
      if (ValidationUtil.isDefined(document)) {
        return document;
      }
    }
    return null;
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
   * @param {GENERAL_DOCUMENT_TYPES | String | undefined} filter.documentType A document type. 
   * * E. g. `"Item"` or `"Actor"`
   * @param {ITEM_TYPES | String | undefined} filter.contentType A content type. 
   * * E. g. `"skill"` or `"npc"`
   * @param {DocumentCollectionSource | undefined} filter.source A document source to 
   * filter by. 
   * * Default `DOCUMENT_COLLECTION_SOURCES.all`.
   * @param {String | undefined} filter.sourcePackId ID of a specific compendium pack to search in. 
   * @param {Boolean | undefined} filter.searchEmbedded If `true`, will also look for embedded 
   * documents. 
   * * Default `false`. 
   * * Note, that this setting may slow searches down, **significantly**. 
   * @param {Boolean | undefined} filter.includeLocked If `true`, will also search in locked 
   * copendium packs. 
   * * Only relevant, if compendium packs are searched. 
   * * Default `true`.
   * 
   * @returns {Promise<Array<Document>>} 
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
    if (!common.util.validation.isDefined(filter.documentType) && !common.util.validation.isDefined(filter.contentType)) {
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
   * @param {String | undefined} filter.sourcePackId ID of a specific compendium pack to search in. 
   * @param {Boolean | undefined} filter.includeLocked If `true`, will also search in locked 
   * copendium packs. 
   * * Only relevant, if compendium packs are searched. 
   * * Default `true`.
   * 
   * @returns {Promise<Document | null>} 
   * 
   * @private
   * @async
   */
  async _findInCompendia(filter = {}) {
    common.util.validation.validateOrThrow(filter, ["source"]);

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
          if (ValidationUtil.isDefined(document)) {
            return document;
          } else {
            document = actor.items.find(it => it.name === filter.name);
          }
        }
      }

      // Skip, if the pack is of the wrong document type. 
      // This skip must happen _after_ the embedded document search. Even if the current 
      // search does not target actor type packs, those actors could still contain 
      // the targeted document instance. 
      if (ValidationUtil.isDefined(filter.documentType) 
        && packDocumentType !== filter.documentType) {
        continue;
      }

      for (const index of pack.index) {
        const id = index._id;

        // Skip, if the entry is of the wrong content type. 
        if (common.util.validation.isDefined(filter.contentType)
          && common.util.validation.isDefined(index.type)
          && index.type.toLowerCase() !== filter.contentType) {
          continue;
        }
        
        // Skip, if neither id nor name match. 
        if (ValidationUtil.isDefined(filter.id) && filter.id !== id) continue;
        if (ValidationUtil.isDefined(filter.name) && filter.name.toLowerCase() !== index.name.toLowerCase()) continue;

        // Get a loaded instance of the document from the data base. 
        return await pack.getDocument(id);
      }
    }
    return null;
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
   * @returns {Document | null} 
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
          if (ValidationUtil.isDefined(document)) {
            return document;
          } else {
            document = actor.items.find(it => it.name === filter.name);
          }
        }
      }

      // Skip, if the collection is of the wrong document type. 
      if (ValidationUtil.isDefined(filter.documentType) 
        && collectionDocumentType != filter.documentType) {
        continue;
      }

      const entries = worldCollection.values();
      for (const entry of entries) {
        // Skip, if the entry is of the wrong content type. 
        if (ValidationUtil.isDefined(filter.contentType) 
          && entry.type.toLowerCase() != filter.contentType) {
          continue;
        }

        // Skip, if neither id nor name match. 
        if (ValidationUtil.isDefined(filter.id) && filter.id !== entry.id) continue;
        if (ValidationUtil.isDefined(filter.name) && filter.name.toLowerCase() !== entry.name.toLowerCase()) continue;

        return entry;
      }
    }
    return null;
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
   * @param {String | undefined} filter.sourcePackId ID of a specific compendium pack to search in. 
   * @param {Boolean | undefined} filter.includeLocked If `true`, will also search in locked 
   * copendium packs. 
   * * Only relevant, if compendium packs are searched. 
   * * Default `true`.
   * 
   * @returns {Promise<Array<Document>>} 
   * 
   * @private
   * @async
   */
  async _findAllInCompendia(filter = {}) {
    common.util.validation.validateOrThrow(filter, ["source"]);

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
      if (ValidationUtil.isDefined(filter.documentType) 
        && packDocumentType !== filter.documentType) {
        continue;
      }

      for (const index of pack.index) {
        const id = index._id;

        // Skip, if the entry is of the wrong content type. 
        if (ValidationUtil.isDefined(filter.contentType) 
          && index.type.toLowerCase() !== filter.contentType) {
          continue;
        }
        
        // Skip, if neither id nor name match. 
        if (ValidationUtil.isDefined(filter.id) && filter.id !== id) continue;
        if (ValidationUtil.isDefined(filter.name) && filter.name.toLowerCase() !== index.name.toLowerCase()) continue;

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
   * @returns {Array<Document>} 
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
      if (ValidationUtil.isDefined(filter.documentType) 
        && collectionDocumentType !== filter.documentType) {
        continue;
      }

      const entries = worldCollection.values();
      for (const entry of entries) {
        // Skip, if the entry is of the wrong content type. 
        if (ValidationUtil.isDefined(filter.contentType) 
          && entry.type.toLowerCase() != filter.contentType) {
          continue;
        }

        // Skip, if neither id nor name match. 
        if (ValidationUtil.isDefined(filter.id) && filter.id !== entry.id) continue;
        if (ValidationUtil.isDefined(filter.name) && filter.name.toLowerCase() !== entry.name.toLowerCase()) continue;

        result.push(entry);
      }
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
   * @param {String | undefined} filter.sourcePackId ID of a specific compendium pack to search in. 
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
      if (ValidationUtil.isDefined(filter.documentType)  
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
        if (common.util.validation.isDefined(filter.contentType) 
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
      if (ValidationUtil.isDefined(filter.documentType) 
        && worldCollection.documentName.toLowerCase() != filter.documentType) {
        continue;
      }

      const entries = worldCollection.values();
      for (const entry of entries) {
        // Skip, if the entry is of the wrong content type. 
        if (ValidationUtil.isDefined(filter.contentType) 
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
    if (ValidationUtil.isDefined(filter.documentType)) {
      filter.documentType = filter.documentType.toLowerCase();
    }
    if (ValidationUtil.isDefined(filter.contentType)) {
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
   * @param {String | undefined} filter.sourcePackId ID of a specific compendium pack to search in. 
   * 
   * @returns {Boolean} True, if the given filter indicates that compendium packs 
   * should be searched. 
   * 
   * @private
   */
  _shouldSearchCompendia(filter) {
    const sourceId = filter.source.name;
    if (sourceId == DOCUMENT_COLLECTION_SOURCES.all.name
      || sourceId == DOCUMENT_COLLECTION_SOURCES.allCompendia.name
      || sourceId == DOCUMENT_COLLECTION_SOURCES.systemCompendia.name
      || sourceId == DOCUMENT_COLLECTION_SOURCES.moduleCompendia.name
      || sourceId == DOCUMENT_COLLECTION_SOURCES.systemAndModuleCompendia.name
      || sourceId == DOCUMENT_COLLECTION_SOURCES.worldCompendia.name
      || sourceId == DOCUMENT_COLLECTION_SOURCES.worldAndWorldCompendia.name
      || common.util.validation.isDefined(filter.sourcePackId)
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
    const sourceId = filter.source.name;
    if (sourceId == DOCUMENT_COLLECTION_SOURCES.all.name
      || sourceId == DOCUMENT_COLLECTION_SOURCES.world.name
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
   * @param {String | undefined} filter.sourcePackId ID of a specific compendium pack to search in. 
   * @param {Object} pack A compendium pack to test. 
   * 
   * @returns {Boolean} True, if the given pack matches the source in the given filter. 
   * 
   * @private
   */
  _packSourceFilterMatches(filter, pack) {
    const type = pack.metadata.packageType.toLowerCase();
    const filterId = filter.source.name;

    // Locked filter precludes all others. 
    if (filter.includeLocked !== true && pack.locked === true) {
      return false;
    }

    // Check by specific ID, if desired.
    if (common.util.validation.isDefined(filter.sourcePackId) && pack.collection !== filter.sourcePackId) {
      return false;
    }

    if (filterId === DOCUMENT_COLLECTION_SOURCES.all.name
      || filterId === DOCUMENT_COLLECTION_SOURCES.allCompendia.name) {
      return true;
    } else if ((filterId === DOCUMENT_COLLECTION_SOURCES.systemCompendia.name 
      || filterId === DOCUMENT_COLLECTION_SOURCES.systemAndModuleCompendia.name)
      && (type === "system")) {
      return true;
    } else if ((filterId === DOCUMENT_COLLECTION_SOURCES.moduleCompendia.name 
      || filterId === DOCUMENT_COLLECTION_SOURCES.systemAndModuleCompendia.name)
      && (type === "module")) {
      return true;
    } else if ((filterId === DOCUMENT_COLLECTION_SOURCES.worldCompendia.name
      || filterId === DOCUMENT_COLLECTION_SOURCES.world.name
      || filterId === DOCUMENT_COLLECTION_SOURCES.worldAndWorldCompendia) 
      && (type === "world")) {
      return true;
    }

    return false;
  }
}
