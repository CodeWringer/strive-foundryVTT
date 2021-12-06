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

/**
 * Returns an item with the given id. 
 * @param {String} id Id of the item to retrieve. 
 * @param {contentCollectionTypes} where Specifies where to search for the item. 
 * @returns {Promise<Item|undefined>} The item, if it could be retrieved. 
 * @async
 */
export async function getItemFrom(id, where = contentCollectionTypes.all) {
  return new Promise(async (resolve, reject) => {
    // Search in world items. 
    if (where === contentCollectionTypes.all || where === contentCollectionTypes.world) {
      for (const item of game.items) {
        if (item.id === id) {
          resolve(item);
          return;
        }
      }
    }
  
    // Search in compendia. 
    if (where === contentCollectionTypes.all || where === contentCollectionTypes.compendia) {
      resolve(await getDocumentFromCompendia(id));
    }
  
    // Search in module compendia. 
    if (where === contentCollectionTypes.all || where === contentCollectionTypes.modules) {
      resolve(await getDocumentFromModuleCompendia(id));
    }
  
    resolve(undefined);
  });
}

/**
 * Returns an actor with the given id. 
 * @param {String} id Id of the actor to retrieve. 
 * @param {contentCollectionTypes} where Specifies where to search for the actor. 
 * @returns {Promise<Actor|undefined>} The actor, if it could be retrieved. 
 * @async
 */
export async function getActorFrom(id, where = contentCollectionTypes.all) {
  return new Promise(async (resolve, reject) => {
    // Search in world actors. 
    if (where === contentCollectionTypes.all || where === contentCollectionTypes.world) {
      for (const actor of game.actors) {
        if (actor.id === id) {
          resolve(actor);
          return;
        }
      }
    }

    // Search in compendia. 
    if (where === contentCollectionTypes.all || where === contentCollectionTypes.compendia) {
      resolve(await getDocumentFromCompendia(id));
    }

    // Search in module compendia. 
    if (where === contentCollectionTypes.all || where === contentCollectionTypes.modules) {
      resolve(await getDocumentFromModuleCompendia(id));
    }
  
    resolve(undefined);
  });
}

/**
 * Returns a document with the given id from compendia. 
 * @param id Id of the document to retrieve. 
 * @returns {Document|undefined}
 * @async
 */
export async function getDocumentFromCompendia(id) {
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
 */
export async function getDocumentFromModuleCompendia(id) {
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