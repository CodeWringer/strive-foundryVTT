import { AmbersteelActor } from "../../documents/actor.mjs";
import AmbersteelItemItem from "../../documents/subtypes/item/ambersteel-item-item.mjs";
import InventoryIndex from "../../dto/inventory-index.mjs";

/**
 * Default column count used to initialize new a item grid. 
 * 
 * There is currently no means of deriving a column count, 
 * therefore all {ItemGrid}s will have this number of columns. 
 * @type {Number}
 * @constant 4
 */
export const COLUMN_COUNT = 4;

/**
 * Represents an item grid. 
 */
export class ItemGrid {
  /**
   * Array of {InventoryIndex} entries. 
   * 
   * For internal use, only!
   * @type {Array<InventoryIndex>}
   * @private
   */
  _indices = [];
  /**
   * Array of {InventoryIndex} entries. 
   * @type {Array<InventoryIndex>}
   * @readonly
   */
  get indices() { return this._indices; }
  
  /**
   * Two-dimensional array, which represents the item grid. 
   * 
   * For internal use, only!
   * @type {Array<Array<InventoryIndex | null>>}
   * @private
   */
  _grid = [];
  /**
   * Two-dimensional array, which represents the item grid. 
   * @type {Array<Array<InventoryIndex | null>>}
   * @readonly
   */
  get grid() { return this._grid; }
  
  /**
   * The maximum number of columns of the grid. 
   * 
   * For internal use, only!
   * @type {Number}
   * @private
   */
  _columnCount = 0;
  /**
   * The maximum number of columns of the grid. 
   * 
   * The actual column count also depends on {capacity}. 
   * @type {Number}
   * @readonly
   */
  get columnCount() { return this._columnCount; }
  
  /**
   * The number of item slots available on grid. 
   * 
   * For internal use, only!
   * @type {Number}
   * @private
   */
  _capactiy = 0;
  /**
   * The number of item slots available on grid. 
   * @type {Number}
   * @readonly
   */
  get capacity() { return this._capactiy; }
  
  /**
   * The owning document. 
   * 
   * This is also the document to synchronize changes to. 
   * 
   * For internal use, only!
   * @type {AmbersteelActor | AmbersteelItem}
   * @private
   */
  _owner = undefined;
  /**
   * The owning document. 
   * 
   * This is also the document to synchronize changes to. 
   * @type {AmbersteelActor | AmbersteelItem}
   * @private
   */
  get owner() { return this._owner; }

  /**
   * Instantiates an empty item grid. 
   * @param {Number} columnCount Number of columns the grid will have, at most. 
   * @param {Number} capacity Number of slots (tiles) the item grid will have. 
   * @param {AmbersteelActor | AmbersteelItem} owner The document whose {ItemGrid} this is. 
   */
  constructor(columnCount, capacity, owner) {
    this._columnCount = columnCount;
    this._capactiy = capacity;
    this._owner = owner;

    // This builds the two-dimensional array sequentially, 
    // row by row. 

    let x = 0; // Current column

    for (let i = 0; i < capacity; i++) {
      while (this._grid.length <= x) {
        this._grid.push([]);
      }
      this._grid[x].push(null);
  
      x++;
      if (x == this._columnCount) {
        x = 0;
      }
    }
  }

  /**
   * Returns a new {ItemGrid}, based on the given actor's or item's 
   * {data.data.assets.grid} and {data.data.assets.gridIndices}.
   * @param {AmbersteelActor | AmbersteelItem} document The actor or item from whose data to build an {ItemGrid}. 
   * @returns {ItemGridLoadResult}
   */
  static from(document) {
    // get the capacity (= item slot count) from the given document. 
    const capacity = document.data.data.assets.maxBulk;
    const columnCount = COLUMN_COUNT;
    // The item grid to return. 
    const itemGrid = new ItemGrid(columnCount, capacity, document);
    // Any items that can not fit on grid, will be added to this list. 
    const itemsDropped = [];

    // Place existing items on grid.  
    const indices = document.data.data.assets.gridIndices;
    for (const index of indices) {
      // Get the item from the context document. 
      const item = document.items.get(index.id);
      // Try to add the item, at its original location. 
      const canItFit = itemGrid.addAt(item, index.x, index.y, index.orientation);
      if (canItFit.result !== true) {
        itemsDropped.push(item);
      }
    }

    // Place new items on grid. 
    const items = document.possessions;
    for (const item of items) {
      // Prevent adding the same item multiple times. Shouldn't be necessary, but in case 
      // it is, this should prevent headaches. 
      if (itemGrid.contains(item)) continue;

      const canItFit = itemGrid.add(item);
      if (canItFit.result !== true) {
        itemsDropped.push(item);
      }
    }

    return new ItemGridLoadResult(itemGrid, itemsDropped);
  }

  /**
   * Updates the given actor's or item's item grid based on this {ItemGrid}. 
   * @param {AmbersteelActor | AmbersteelItem} document 
   * @param {Boolean} update If true, will push the changes to the db. Default true. 
   * @async
   * @returns {Promise<undefined>}
   */
  async synchronizeTo(document, update = true) {
    if (update === true) {
      return document.update({
        data: {
          assets: {
            grid: this._grid,
            gridIndices: this._indices
          }
        }
      });
    } else {
      return new Promise((resolve, reject) => {
        // This data will *not* be persisted!
        // When a document is initialized, its grid may be empty. This is the case with new documents. 
        // The ItemGrid and ItemGridView classes expect an initialized grid, however. 
        // In that case, the empty grid will be initialized, so it has the correct number of 
        // columns and rows. 
        // Since updating an document's db entry causes it to be re-rendered, this causes an 
        // unnecessary chain-reaction of initializations to occur, which would result in infinite recursion. 
        document.data.data.assets.grid = this._grid;
        document.data.data.assets.gridIndices = this._indices;

        resolve();
      });
    }
  }

  /**
   * Updates the owning actor's or item's item grid based on this {ItemGrid}. 
   * @param {Boolean} update If true, will push the changes to the db. Default true. 
   * @async
   * @returns {Promise<undefined>}
   */
  async synchronize(update = true) {
    return this.synchronizeTo(this._owner, update);
  }
  
  /**
   * Places an item at the given position, with the given orientation, if possible. 
   * 
   * NOTE: Callers of this function must, in order to persist the change to the db, also call 'synchronize'!
   * @param {AmbersteelItemItem} item The item to place on grid. 
   * @param {Number} x Column index on grid. 
   * @param {Number} y Row index on grid. 
   * @param {CONFIG.itemOrientations} orientation Target orientation of the item. 
   * @returns {Boolean} 'true', if the item could be added, otherwise, 'false'.
   */
  addAt(item, x, y, orientation) {
    if (this.contains(item)) {
      return false;
    }

    const canItFit = this.canItemFitOnGridAt(item, x, y, orientation);
    if (canItFit.result !== true) {
      return false;
    }
    
    this._addAt(item, x, y, canItFit.orientation);

    return true;
  }
  
  /**
   * Adds the given item to the next free slot on the grid, with the given orientation, if possible. 
   * 
   * NOTE: Callers of this function must, in order to persist the change to the db, also call 'synchronize'!
   * @param {AmbersteelItemItem} item 
   * @param {CONFIG.itemOrientations} orientation Optional. If left undefined, will rotate the item as needed 
   * to fit it on grid. If defined, will only use that orientation. 
   * @returns {Boolean} 'true', if the item could be added, otherwise, 'false'.
   */
  add(item, orientation = undefined) {
    if (this.contains(item)) {
      return false;
    }

    const canItFit = this.canItemFitOnGrid(item, orientation);
    if (canItFit.result !== true) {
      return false;
    }
    
    this._addAt(item, canItFit.x, canItFit.y, canItFit.orientation);

    return true;
  }
  
  /**
   * Removes the given item from the grid, if possible. 
   * 
   * NOTE: Callers of this function must, in order to persist the change to the db, also call 'synchronize'!
   * @param {AmbersteelItemItem} item 
   * @returns {Boolean} True, if the given item could be removed. 
   */
  remove(item) {
    const itemIndex = this.getIndexOf(item);

    if (itemIndex === undefined) {
      return false;
    }

    // Remove from index. 
    const index = this._indices.indexOf(itemIndex);
    this._indices.splice(index, 1);

    // Remove from grid. 
    const right = x + shape.width - 1;
    const bottom = y + shape.height - 1;
    
    for (let iX = x; iX <= right; iX++) {
      for (let iY = y; iY <= bottom; iY++) {
        this._grid[iX][iY] = null;
      }
    }

    return true;
  }

  /**
   * Moves the given item, if it is on grid, to the given coordinates and rotation. 
   * 
   * NOTE: Callers of this function must, in order to persist the change to the db, also call 'synchronize'!
   * @param {AmbersteelItemItem} item The item to move. 
   * @param {Number} x Column index on grid. 
   * @param {Number} y Row index on grid. 
   * @param orientation Target orientation of the item on grid. 
   * @returns {Boolean} 'true', if the given item could be moved, otherwise, 'false'. 
   */
  move(item, x, y, orientation) {
    if (this.contains(item) !== true) {
      // Cannot move an item that isn't even on the grid. 
      return false;
    }

    const canItFit = this.canItemFitOnGridAt(item, x, y, orientation);
    if (canItFit.result !== true) {
      return false;
    }

    // Remove from previous location. 
    this.remove(item);

    // Add to new location. 
    this._addAt(item, x, y, orientation);

    return true;
  }

  /**
   * Returns true, if the given item is already contained on the grid. 
   * @param {AmbersteelItemItem} item The item to test. 
   * @returns {Boolean} True, if the given item is already contained on grid.
   */
  contains(item) {
    return this.getIndexOf(item) !== undefined;
  }
  
  /**
   * @param {AmbersteelItemItem} item The item to test. 
   * @returns {InventoryIndex | undefined}
   */
  getIndexOf(item) {
    for (const index of this._indices) {
      if (index.id === item.id) {
        return index;
      }
    }
    return undefined;
  }

  /**
   * Tests if the given item could fit on the item grid and returns the result, 
   * which contains the grid coordinates and orientation of where it would fit. 
   * @param {AmbersteelItemItem} item 
   * @param {CONFIG.itemOrientations} orientation Optional. If not undefined, will only test with that specific 
   * orientation. If left undefined, will test every possible orientation in succession. 
   * @returns {GridCapacityTestResult}
   */
  canItemFitOnGrid(item, orientation = undefined) {
    const columnCount = this._columnCount;
    
    for (let x = 0; x < columnCount; x++) {
      const rowCount = this._grid[x].length;
      for (let y = 0; y < rowCount; y++) {
        if (orientation !== undefined) {
          // Test with given orientation. 
          const result = this.canItemFitOnGridAt(item, x, y, orientation);
          if (result.result === true) return result;
        } else {
          // Test with default (vertical) orientation. 
          let result = this.canItemFitOnGridAt(item, x, y, game.ambersteel.config.itemOrientations.vertical);
          if (result.result === true) return result;
          
          // Test with rotated (horizontal) orientation. 
          result = this.canItemFitOnGridAt(item, x, y, game.ambersteel.config.itemOrientations.horizontal);
          if (result.result === true) return result;
        }
      }
    }
    
    return new GridCapacityTestResult(false, undefined, undefined, undefined);
  }
  
  
  /**
   * Tests if the given item could fit on the item grid at the given coordinates and returns the result, 
   * which contains the grid coordinates and orientation of where it would fit. 
   * @param {AmbersteelItemItem} item 
   * @param {CONFIG.itemOrientations} orientation
   * @returns {GridCapacityTestResult}
   */
  canItemFitOnGridAt(item, x, y, orientation) {
    const shape = this._getOrientedShape(item.data.data.shape, orientation);
    const failureResult = new GridCapacityTestResult(false, undefined, undefined, undefined);

    const rowCount = this._grid[x].length;
    
    // Test for bounds of grid.
    if (x + shape.width - 1 >= this._columnCount) return failureResult;
    if (y + shape.height - 1 >= rowCount) return failureResult;
    
    // Test for overlap. 
    const overlappedItems = this.getItemsOnGridWithin(x, y, shape.width, shape.height);
    if (overlappedItems.length === 0) {
      // Success
      return new GridCapacityTestResult(true, x, y, orientation);
    }

    return failureResult;
  }

  /**
   * Returns all items on grid that can be at least partially contained by a 
   * rectangle spanning the given dimensions, at the given position. 
   * @param {Number} x In grid coordinates. 
   * @param {Number} y In grid coordinates. 
   * @param {Number} width In grid coordinates. 
   * @param {Number} height In grid coordinates. 
   * @returns {Array<GridOverlapTestResult>}
   */
  getItemsOnGridWithin(x, y, width, height) {
    const result = [];

    const right = x + width - 1;
    const bottom = y + height - 1;

    for (let iX = x; iX <= right; iX++) {
      for (let iY = y; iY <= bottom; iY++) {
        const itemOnGrid = this._grid[iX][iY];
        if (itemOnGrid !== null) {
          const itemRight = itemOnGrid.x + itemOnGrid.w - 1;
          const itemBottom = itemOnGrid.y + itemOnGrid.h - 1;

          // Ensure no duplicate entries. 
          const duplicate = result.find((element) => { return element.id === itemOnGrid.id; });
          if (duplicate !== undefined) continue;

          const isPartial = ((itemOnGrid.x < iX) || (itemRight > right) 
            || itemOnGrid.y < iY || itemBottom > bottom);

          result.push(new GridOverlapTestResult(itemOnGrid, isPartial));
        }
      }
    }

    return result;
  }

  /**
   * Places an item at the given position, with the given orientation, if possible. 
   * 
   * Warning: will override any potentially overlapped items! Intended for internal use, only!
   * @param {AmbersteelItemItem} item 
   * @param {Number} x 
   * @param {Number} y 
   * @param {CONFIG.itemOrientations} orientation 
   * @private
   */
  _addAt(item, x, y, orientation) {
    const shape = this._getOrientedShape(item.data.data.shape, orientation);

    // Add to indices. 
    const itemIndex = new InventoryIndex({ x: x, y: y, w: shape.width, h: shape.height, id: item.id, orientation: orientation });
    this._indices.push(itemIndex);
    
    // Add to grid. 
    const right = x + shape.width - 1;
    const bottom = y + shape.height - 1;
    
    for (let iX = x; iX <= right; iX++) {
      for (let iY = y; iY <= bottom; iY++) {
        this._grid[iX][iY] = itemIndex;
      }
    }
  }

  /**
   * Returns a shape, based on the given shape and orientation. 
   * 
   * The given shape is not modified, in any way, during this operation. 
   * @param {Object} shape 
   * @param {CONFIG.itemOrientations} orientation 
   */
  _getOrientedShape(shape, orientation = undefined) {
    return {
      width: orientation === game.ambersteel.config.itemOrientations.horizontal ? shape.height : shape.width,
      height: orientation === game.ambersteel.config.itemOrientations.horizontal ? shape.width : shape.height
    };
  }
}

/**
 * Represents the result of a test whether an item can fit on the item grid. 
 */
export class GridCapacityTestResult {
  /**
   * @param {Boolean} result True, if the item can fit. 
   * @param {Number} x Column on grid where the item can fit. 
   * @param {Number} y Row on grid where the itme can fit. 
   * @param {CONFIG.itemOrientations} orientation Which orientation the item must be in to be able to fit. 
   */
  constructor(result, x, y, orientation) {
    this.result = result;
    this.x = x;
    this.y = y;
    this.orientation = orientation;
  }
}

/**
 * Represents the result of a test which items on the grid overlap a given region on the grid. 
 */
export class GridOverlapTestResult {
  /**
   * @param {InventoryIndex} item The item overlapped by the region on grid. 
   * @param {Boolean} isPartial If true, the item in question is only partially contained. 
   */
  constructor(item, isPartial) {
    this.item = item;
    this.isPartial = isPartial;
  }
}

/**
 * Represents the result of loading (creating) an {ItemGrid}, based on an {AmbersteelActor}'s or 
 * {AmbersteelItem}'s data. 
 */
export class ItemGridLoadResult {
  /**
   * @param {ItemGrid} itemGrid The loaded and instantiated {ItemGrid}. 
   * @param {Array<AmbersteelItemItem>} itemsDropped A list of items which couldn't be fit onto the grid. 
   */
  constructor(itemGrid, itemsDropped) {
    this.itemGrid = itemGrid;
    this.itemsDropped = itemsDropped;
  }
}