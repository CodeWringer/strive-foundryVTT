/**
 * Determines the possible source(s) in which to search for documents. 
 * @property {Number} all Search in the world, the world and system compendia and module compendia.
 * @property {Number} compendia Search only in compendia (world and system compendia).
 * @property {Number} modules Search only in module compendia.
 * @property {Number} world Search only in the world.
 */
export const contentCollectionTypes = {
  all: 0,
  compendia: 1,
  modules: 2,
  world: 3
}

/**
 * @property {String} id
 * @property {String} name
 * @property {contentCollectionTypes} where
 */
export class ItemEntry {
  constructor(id, name, where) {
    this.id = id;
    this.name = name;
    this.where = where;
  }
}

/************ Returning document declarations ************/

/**
 * Returns all item declarations of the given type from the specified source. 
 * @param {String} type Item type to search for. E. g. "skill" or "fate-card"
 * @param {contentCollectionTypes} where Specifies where to collect from. 
 * @returns {Array<ItemEntry>} A list of item metadata. 
 * @async
 */
export function getItemDeclarations(type, where = contentCollectionTypes.all) {
  const result = [];

  // Collect from compendia. 
  if (where === contentCollectionTypes.all || where === contentCollectionTypes.compendia) {
    for (const pack of game.packs) {
      for (const entry of pack.index) {
        if (entry.type == type) {
          result.push(new ItemEntry(getId(entry), entry.name, contentCollectionTypes.compendia));
        }
      }
    }
  }

  // Collect from module compendia. 
  if (where === contentCollectionTypes.all || where === contentCollectionTypes.modules) {
    for (const module of game.modules) {
      if (!module.packs) break;

      for (const pack of module.packs) {
        if (pack.metadata.name == type) {
          for (const entry of pack.index) {
            result.push(new ItemEntry(getId(entry), entry.name, contentCollectionTypes.modules));
          }
        }
      }
    }
  }

  // Collect from world items. 
  if (where === contentCollectionTypes.all || where === contentCollectionTypes.world) {
    for (const entry of game.items) {
      if (entry.type === type) {
        result.push(new ItemEntry(getId(entry), entry.name, contentCollectionTypes.world));
      }
    }
  }

  return result;
}

/************ Returning documents ************/

/**
 * Returns a document matching the given filter. 
 * @param {Object} filter 
 * @param {String} filter.id 
 * @param {String} filter.name 
 * @param {String} filter.pack 
 * @param {contentCollectionTypes} where Specifies where to search for the document. 
 * @returns {Promise<Document|undefined>} The document, if it could be retrieved. 
 * @async
 */
export async function findDocument(filter, where = contentCollectionTypes.all) {
  return await _getDocumentFrom(filter, where);
}

/**
 * Returns an item matching the given filter. 
 * @param {Object} filter 
 * @param {String} filter.id 
 * @param {String} filter.name 
 * @param {String} filter.pack 
 * @param {contentCollectionTypes} where Specifies where to search for the item. 
 * @returns {Promise<Item|undefined>} The item, if it could be retrieved. 
 * @async
 */
export async function findItem(filter, where = contentCollectionTypes.all) {
  return await _getDocumentFrom(filter, where, [game.items]);
}

/**
 * Returns an actor matching the given filter. 
 * @param {Object} filter 
 * @param {String} filter.id 
 * @param {String} filter.name 
 * @param {String} filter.pack 
 * @param {contentCollectionTypes} where Specifies where to search for the actor. 
 * @returns {Promise<Actor|undefined>} The actor, if it could be retrieved. 
 * @async
 */
export async function findActor(filter, where = contentCollectionTypes.all) {
  return await _getDocumentFrom(filter, where, [game.actors]);
}

/**
 * Returns a journal entry matching the given filter. 
 * @param {Object} filter 
 * @param {String} filter.id 
 * @param {String} filter.name 
 * @param {String} filter.pack 
 * @param {contentCollectionTypes} where Specifies where to search for the journal entry. 
 * @returns {Promise<JournalEntry|undefined>} The journal entry, if it could be retrieved. 
 * @async
 */
export async function findJournal(filter, where = contentCollectionTypes.all) {
  return await _getDocumentFrom(filter, where, [game.journal]);
}

/**
 * Returns a roll table matching the given filter. 
 * @param {Object} filter 
 * @param {String} filter.id 
 * @param {String} filter.name 
 * @param {String} filter.pack 
 * @param {contentCollectionTypes} where Specifies where to search for the roll table. 
 * @returns {Promise<RollTable|undefined>} The roll table, if it could be retrieved. 
 * @async
 */
export async function findRollTable(filter, where = contentCollectionTypes.all) {
  return await _getDocumentFrom(filter, where, [game.tables]);
}

/**
 * Returns a document matching the given filter. 
 * 
 * This is the internal version of the getDocumentFrom function, wich allows 
 * filtering the world collections to search. 
 * @param {Object} filter 
 * @param {String} filter.id 
 * @param {String} filter.name 
 * @param {String} filter.pack 
 * @param {contentCollectionTypes} where Specifies where to search for the document. 
 * @returns {Promise<Document|undefined>} The document, if it could be retrieved. 
 * @async
 * @private
 */
async function _getDocumentFrom(filter, where = contentCollectionTypes.all, worldCollections = [game.items, game.actors, game.journal, game.tables]) {
  return new Promise(async (resolve, reject) => {
    // Search in world items. 
    if (where === contentCollectionTypes.all || where === contentCollectionTypes.world) {
      for (const worldCollection of worldCollections) {
        for (const entry of worldCollection) {
          if (matchesFilter(filter, entry)) {
            resolve(entry);
            return;
          } else if (worldCollection == game.actors) {
            // Also search in actors, because they can have embedded documents. 
            const result = entry.items.find(it => { return matchesFilter(filter, it) })
            if (result !== undefined) {
              resolve(result);
              return;
            }
          }
        }
      }
    }
  
    // Search in compendia. 
    if (where === contentCollectionTypes.all || where === contentCollectionTypes.compendia) {
      const result = await _getDocumentFromCompendia(filter);
      if (result !== undefined) {
        resolve(result);
        return;
      }
    }
    
    // Search in module compendia. 
    if (where === contentCollectionTypes.all || where === contentCollectionTypes.modules) {
      const result = await _getDocumentFromModuleCompendia(filter);
      if (result !== undefined) {
        resolve(result);
        return;
      }
    }
  
    game.ambersteel.logger.logWarn(`Failed to retrieve document`);
    reject(result);
  });
}

/**
 * Returns a list of actor type documents found in the given sources. 
 * @param {Object} where
 * @param {Boolean | undefined} where.world If true, includes entries from world. 
 * @param {Boolean | undefined} where.worldCompendia If true, includes entries from world compendia. 
 * @param {Boolean | undefined} where.systemCompendia If true, includes entries from system compendia. 
 * @returns {Array<Document>} 
 */
export async function getActors(where) {
  const result = [];
  where = {
    world: where.world ?? false,
    worldCompendia: where.worldCompendia ?? false,
    systemCompendia: where.systemCompendia ?? false,
  };

  // Get loaded documents from the world. 
  if (where.world === true) {
    for (const entry of game.actors) {
      result.push(entry);
    }
  }

  // Get and load documents from compendia. 
  if (where.worldCompendia === true || where.systemCompendia === true) {
    for (const pack of game.packs) {
      if (pack.metadata.type !== "Actor")
        continue;
      if (pack.metadata.package === "ambersteel" && where.systemCompendia !== true) 
        continue;
      if (pack.metadata.package === "world" && where.worldCompendia !== true) 
        continue;

      for (const index of pack.index) {
        const id = getId(index);
        const loadedDocument = await pack.getDocument(id);
        result.push(loadedDocument);
      }
    }
  }

  return result;
}

/**
 * Returns a document matching the given filter from compendia. 
 * @param {Object} filter 
 * @param {String} filter.id 
 * @param {String} filter.name 
 * @param {String} filter.pack 
 * @returns {Promise<Document|undefined>}
 * @async
 * @private
 */
async function _getDocumentFromCompendia(filter) {
  return new Promise(async (resolve, reject) => {
    let result = undefined;

    for (const pack of game.packs) {
      for (const index of pack.index) {
        const id = getId(index);
        const loadedDocument = await pack.getDocument(id);
        if (matchesFilter(filter, loadedDocument)) {
          result = loadedDocument;
        }
      }
    }
    resolve(result);
  });
}

/**
 * Returns a document matching the given filter from module compendia. 
 * @param {Object} filter 
 * @param {String} filter.id 
 * @param {String} filter.name 
 * @param {String} filter.pack 
 * @returns {Promise<Document|undefined>}
 * @async
 * @private
 */
async function _getDocumentFromModuleCompendia(filter) {
  return new Promise(async (resolve, reject) => {
    let result = undefined;

    for (const module of game.modules) {
      if (!module.packs) continue;

      for (const pack of module.packs) {
        if (pack.metadata.name == type) {
          const id = getId(pack.metadata);
          const loadedDocument = await pack.getDocument(id);
          if (matchesFilter(filter, loadedDocument)) {
            result = loadedDocument;
          }
        }
      }
    }
    resolve(result);
  });
}

/**
 * Returns the id of the given entry. 
 * @param {Document} entry 
 * @returns {String}
 */
function getId(entry) {
  if (entry.id !== undefined) {
    return entry.id;
  } else if (entry._id !== undefined) {
    return entry._id;
  } else {
    game.ambersteel.logger.logWarn('Failed to get id from given item:', entry);
    return undefined;
  }
}

/**
 * Returns true, if the given entry matches the given filter. 
 * @param {Object} filter 
 * @param {String} filter.id 
 * @param {String} filter.name 
 * @param {String} filter.pack 
 * @param {Document} entry 
 * @returns {Boolean}
 */
function matchesFilter(filter, entry) {
  if (filter.id !== undefined) {
    if (getId(entry) !== filter.id && entry.name !== filter.id) {
      return false;
    }
  }

  if (filter.name !== undefined) {
    if (entry.name !== filter.name) {
      return false;
    }
  }

  if (filter.pack !== undefined) {
    if (entry.pack !== filter.pack) {
      return false;
    }
  }

  return true;
}
