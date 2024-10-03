import sinon from 'sinon';

/**
 * @constant
 */
export const MigratorTestBase = {
  setup: function(versionString) {
    this.mockGameSystemVersion(versionString);
  },
  
  tearDown: function() {
    globalThis.game = null;
    globalThis.game = undefined;
  },
  
  /**
   * Sets up the game system version. 
   * 
   * @param {String} versionString A game version string. 
   * * E. g. `"1.5.1"`
   */
  mockGameSystemVersion: function(versionString) {
    if (globalThis.game === undefined) {
      globalThis.game = {};
    }
    globalThis.game.system = {
      version: versionString,
    };
    globalThis.game.settings = {
      register: sinon.fake(),
      get: () => globalThis.game.system.version,
      set: (n, key, value) => { globalThis.game.system.version = value; },
    };
  },
  
  /**
   * Creates a new map, modifies it to look like a FoundryVTT world collection 
   * (e. g. `game.actors`) and returns it. 
   * 
   * @param {String} documentName The document type of the collection. 
   * * E. g. `"Actor"`. 
   * @param {Array<Object>} items 
   * * Every element is expected to be an object with the following field(s): 
   * * * `id: {String}`
   * 
   * @returns {Map}
   */
  createMockWorldCollection: function(documentName, items) {
    const map = new Map();
    map.documentName = documentName;
  
    const _items = (items ?? []);
    for (const item of _items) {
      map.set(item.id, item);
    }
  
    // Setup a custom iterator, because that's what FoundryVTT does. 
    map[Symbol.iterator] = function*() {
      return this.values();
    }
  
    return map;
  },
}
