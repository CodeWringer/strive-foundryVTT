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
          result.push(new ItemEntry(entry._id, entry.name, contentCollectionTypes.compendia));
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
            result.push(new ItemEntry(entry._id, entry.name, contentCollectionTypes.modules));
          }
        }
      }
    }
  }

  // Collect from world items. 
  if (where === contentCollectionTypes.all || where === contentCollectionTypes.world) {
    for (const item of game.items) {
      if (item.type === type) {
        result.push(new ItemEntry(item._id, item.name, contentCollectionTypes.world));
      }
    }
  }

  return result;
}

/************ Returning documents ************/

/**
 * Returns a document with the given id. 
 * @param {String} id Id of the document to retrieve. 
 * @param {contentCollectionTypes} where Specifies where to search for the document. 
 * @returns {Promise<Document|undefined>} The document, if it could be retrieved. 
 * @async
 */
export async function findDocument(id, where = contentCollectionTypes.all) {
  return await _getDocumentFrom(id, where);
}

/**
 * Returns an item with the given id. 
 * @param {String} id Id of the item to retrieve. 
 * @param {contentCollectionTypes} where Specifies where to search for the item. 
 * @returns {Promise<Item|undefined>} The item, if it could be retrieved. 
 * @async
 */
export async function findItem(id, where = contentCollectionTypes.all) {
  return await _getDocumentFrom(id, where, [game.items]);
}

/**
 * Returns an actor with the given id. 
 * @param {String} id Id of the actor to retrieve. 
 * @param {contentCollectionTypes} where Specifies where to search for the actor. 
 * @returns {Promise<Actor|undefined>} The actor, if it could be retrieved. 
 * @async
 */
export async function findActor(id, where = contentCollectionTypes.all) {
  return await _getDocumentFrom(id, where, [game.actors]);
}

/**
 * Returns a journal entry with the given id. 
 * @param {String} id Id of the journal entry to retrieve. 
 * @param {contentCollectionTypes} where Specifies where to search for the journal entry. 
 * @returns {Promise<JournalEntry|undefined>} The journal entry, if it could be retrieved. 
 * @async
 */
export async function findJournal(id, where = contentCollectionTypes.all) {
  return await _getDocumentFrom(id, where, [game.journal]);
}

/**
 * Returns a roll table with the given id. 
 * @param {String} id Id of the roll table to retrieve. 
 * @param {contentCollectionTypes} where Specifies where to search for the roll table. 
 * @returns {Promise<RollTable|undefined>} The roll table, if it could be retrieved. 
 * @async
 */
export async function findRollTable(id, where = contentCollectionTypes.all) {
  return await _getDocumentFrom(id, where, [game.tables]);
}

/**
 * Returns a document with the given id. 
 * 
 * This is the internal version of the getDocumentFrom function, wich allows 
 * filtering the world collections to search. 
 * @param {String} id Id of the document to retrieve. 
 * @param {contentCollectionTypes} where Specifies where to search for the document. 
 * @returns {Promise<Document|undefined>} The document, if it could be retrieved. 
 * @async
 * @private
 */
async function _getDocumentFrom(id, where = contentCollectionTypes.all, worldCollections = [game.items, game.actors, game.journal, game.tables]) {
  return new Promise(async (resolve, reject) => {
    // Search in world items. 
    if (where === contentCollectionTypes.all || where === contentCollectionTypes.world) {
      for (const worldCollection of worldCollections) {
        for (const entry of worldCollection) {
          if (entry.id === id) {
            resolve(entry);
            return;
          }
        }
      }
    }
  
    // Search in compendia. 
    if (where === contentCollectionTypes.all || where === contentCollectionTypes.compendia) {
      resolve(await _getDocumentFromCompendia(id));
    }
  
    // Search in module compendia. 
    if (where === contentCollectionTypes.all || where === contentCollectionTypes.modules) {
      resolve(await _getDocumentFromModuleCompendia(id));
    }
  
    resolve(undefined);
  });
}

/**
 * Returns a document with the given id from compendia. 
 * @param id Id of the document to retrieve. 
 * @returns {Document|undefined}
 * @async
 * @private
 */
async function _getDocumentFromCompendia(id) {
  for (const pack of game.packs) {
    for (const entry of pack.index) {
      if (entry._id === id) {
        return await pack.getDocument(id);
      }
    }
  }
  console.warn(`No document with id '${id}' could be retrieved from compendia`);
  return undefined;
}

/**
 * Returns a document with the given id from module compendia. 
 * @param id Id of the document to retrieve. 
 * @returns {Document|undefined}
 * @async
 * @private
 */
async function _getDocumentFromModuleCompendia(id) {
  for (const module of game.modules) {
    if (!module.packs) continue;

    for (const pack of module.packs) {
      if (pack.metadata.name == type) {
        for (const entry of pack.index) {
          if (entry._id === id) {
            return await pack.getDocument(id);
          }
        }
      }
    }
  }
  console.warn(`No document with id '${id}' could be retrieved from module compendia`);
  return undefined;
}