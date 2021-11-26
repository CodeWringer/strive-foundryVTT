export const contentCollectionTypes = {
  all: 0,
  compendiums: 1,
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
 * Returns all items of the given type from the specified location. 
 * @param {String} type Item type to look for. E. g. "skill"
 * @param {contentCollectionTypes} where Specifies where to collect from. 
 * @returns {Array<ItemEntry>} A list of item metadata. 
 */
export function getItemDeclarationsFrom(type, where = contentCollectionTypes.all) {
  const result = [];

  // Collect from compendiums. 
  if (where === contentCollectionTypes.all || where === contentCollectionTypes.compendiums) {
    for (const pack of game.packs) {
      for (const entry of pack.index) {
        if (entry.type == type) {
          result.push(new ItemEntry(entry._id, entry.name, contentCollectionTypes.compendiums));
        }
      }
    }
  }

  // Collect from module compendiums. 
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
 * @param {contentCollectionTypes} where Specifies where to look for the item. 
 * @returns {Item|undefined} The item, if it could be retrieved. 
 */
export async function getItemFrom(id, where = contentCollectionTypes.all) {
  // Look in world items. 
  if (where === contentCollectionTypes.all || where === contentCollectionTypes.world) {
    for (const item of game.items) {
      if (item.id === id) {
        return item;
      }
    }
  }

  // Look in compendiums. 
  if (where === contentCollectionTypes.all || where === contentCollectionTypes.compendiums) {
    for (const pack of game.packs) {
      for (const entry of pack.index) {
        if (entry._id === id) {
          return await pack.getDocument(id);
        }
      }
    }
  }

  // Look in module compendiums. 
  if (where === contentCollectionTypes.all || where === contentCollectionTypes.modules) {
    for (const module of game.modules) {
      if (!module.packs) break;

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
  }

  return undefined;
}