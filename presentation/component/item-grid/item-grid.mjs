import InventoryIndex from "../../../business/item-grid/inventory-index.mjs";
import { ITEM_ORIENTATIONS } from "../../../business/item-grid/item-orientations.mjs";

/**
 * Default column count used to initialize new a item grid. 
 * 
 * There is currently no means of deriving a column count, 
 * therefore all {ItemGrid}s will (at most) have this number of columns. 
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
   * Array of {AmbersteelItemItem} entries. 
   * 
   * For internal use, only!
   * @type {Array<AmbersteelItemItem>}
   * @private
   */
  _items = [];
  /**
   * Array of {AmbersteelItemItem} entries. 
   * @type {Array<AmbersteelItemItem>}
   * @readonly
   */
  get items() { return this._items; }
  
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
   * @type {TransientDocument}
   * @private
   */
  _owner = undefined;
  /**
   * The owning document. 
   * 
   * This is also the document to synchronize changes to. 
   * @type {TransientDocument}
   * @readonly
   */
  get owner() { return this._owner; }

  /**
   * Instantiates an empty item grid. 
   * @param {Number} columnCount Number of columns the grid will have, at most. 
   * @param {Number} capacity Number of slots (tiles) the item grid will have. 
   * @param {TransientDocument} owner The document whose {ItemGrid} this is. 
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
   * Returns a new {ItemGrid}, based on the given actor. 
   * @param {TransientBaseCharacterActor} document The actor from whose data to build an {ItemGrid}. 
   * @returns {ItemGridLoadResult}
   */
  static from(document) {
    // get the capacity (= item slot count) from the given document. 
    const capacity = document.assets.maxBulk;
    const columnCount = COLUMN_COUNT;
    // The item grid to return. 
    const itemGrid = new ItemGrid(columnCount, capacity, document);
    // Any items that can not fit on grid, will be added to this list. 
    const itemsDropped = [];
    // Any item indices that cause errors on load are added to this list. 
    const itemsError = [];

    // Place existing items on grid.  
    const indices = document.assets.gridIndices;
    for (const index of indices) {
      // Get the item from the context document. 
      const item = document.items.find(it => it.id === index.id);

      if (item === undefined) {
        game.ambersteel.logger.logWarn(`Failed to get an item with id '${index.id}' from parent document with id '${document.id}'! Removing it from the index...`);
        
        itemsError.push(index.id);

        itemGrid._removeFromIndex(index);
        itemGrid._removeFromGrid(index);

        continue;
      }

      // Try to add the item, at its original location. 
      const canItFit = itemGrid.addAt(item, index.x, index.y, index.orientation);
      if (canItFit !== true) {
        itemsDropped.push(item);
      }
    }

    // Place new items on grid. 
    const items = document.assets.onPerson;
    for (const item of items) {
      // Skip any items that were dropped. 
      if (itemsDropped.find(it => { return it.id === item.id }) !== undefined) continue;
      // Prevent adding the same item multiple times. Shouldn't be necessary, but in case 
      // it is, this should prevent headaches. 
      if (itemGrid.contains(item)) continue;

      const canItFit = itemGrid.add(item);
      if (canItFit !== true) {
        itemsDropped.push(item);
      }
    }

    return new ItemGridLoadResult(itemGrid, itemsDropped, itemsError);
  }

  /**
   * Updates the given actor's or item's item grid based on this {ItemGrid}. 
   * @param {TransientBaseCharacterActor} document 
   * @param {Boolean | undefined} render If true, will trigger a re-render of the associated document sheet. Default 'true'. 
   * @async
   * @returns {Promise<undefined>}
   */
  async synchronizeTo(document, render = true) {
    document.assets.grid = this._grid;
    document.assets.gridIndices = this._indices;

    return document.update({
      data: {
        assets: {
          grid: this._grid,
          gridIndices: this._indices
        }
      }
    }, { render: render });
  }

  /**
   * Updates the owning actor's or item's item grid based on this {ItemGrid}. 
   * @param {Boolean | undefined} render If true, will trigger a re-render of the associated document sheet. Default 'true'. 
   * @async
   * @returns {Promise<undefined>}
   */
  async synchronize(render = true) {
    return this.synchronizeTo(this._owner, render);
  }
  
  /**
   * Places an item at the given position, with the given orientation, if possible. 
   * 
   * NOTE: Callers of this function must, in order to persist the change to the db, also call 'synchronize'!
   * @param {AmbersteelItemItem} item The item to place on grid. 
   * @param {Number} x Column index on grid. 
   * @param {Number} y Row index on grid. 
   * @param {ITEM_ORIENTATIONS} orientation Target orientation of the item. 
   * @returns {Boolean} 'true', if the item could be added, otherwise, 'false'.
   */
  addAt(item, x, y, orientation) {
    if (this.contains(item)) {
      return false;
    }

    const canItFit = this.canItemFitOnGridAt(item, x, y, orientation, false);
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
   * @param {ITEM_ORIENTATIONS} orientation Optional. If left undefined, will rotate the item as needed 
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

    this._removeFromIndex(itemIndex);
    this._removeFromGrid(itemIndex);
    this._removeFromList(item);

    return true;
  }

  /**
   * Moves the given item, if it is on grid, to the given coordinates and rotation. 
   * 
   * NOTE: Callers of this function must, in order to persist the change to the db, also call 'synchronize'!
   * @param {AmbersteelItemItem} item The item to move. 
   * @param {Number} x Column index on grid. 
   * @param {Number} y Row index on grid. 
   * @param {ITEM_ORIENTATIONS} orientation Target orientation of the item on grid. 
   * @returns {Boolean} 'true', if the given item could be moved, otherwise, 'false'. 
   */
  move(item, x, y, orientation) {
    if (this.contains(item) !== true) {
      // Cannot move an item that isn't even on the grid. 
      return false;
    }

    const canItFit = this.canItemFitOnGridAt(item, x, y, orientation, false);
    if (canItFit.result !== true) {
      return false;
    }

    // Remove given item from previous location. 
    this.remove(item);
    
    // TODO: Handle switching locations of overlapped items. 

    // Add given item to new location. 
    this._addAt(item, x, y, orientation);
    
    return true;
  }
  
  /**
   * Rotates the given item in-place, if it is on grid. 
   * 
   * Optionally, the item orientation can be set to a given orientation. 
   * 
   * NOTE: Callers of this function must, in order to persist the change to the db, also call 'synchronize'!
   * @param {AmbersteelItemItem} item 
   * @param {ITEM_ORIENTATIONS} orientation Optional. If not undefined, this is the target orientation. 
   * If undefined, will toggle from 'horizontal' to 'vertical', or vice-versa. 
   * @returns {Boolean} 'true', if the given item could be rotated, otherwise, 'false'. 
   */
  rotate(item, orientation = undefined) {
    if (this.contains(item) !== true) {
      // Cannot move an item that isn't even on the grid. 
      return false;
    }
    
    const index = this.getIndexOf(item);
    
    if (orientation === undefined) {
      if (index.orientation === ITEM_ORIENTATIONS.vertical) {
        orientation = ITEM_ORIENTATIONS.horizontal;
      } else if (index.orientation === ITEM_ORIENTATIONS.horizontal) {
        orientation = ITEM_ORIENTATIONS.vertical;
      }
    }
    
    const canItFit = this.canItemFitOnGridAt(item, index.x, index.y, orientation, false);
    if (canItFit.result !== true) {
      return false;
    }
    
    // Remove from previous location. 
    this.remove(item);

    // TODO: Handle switching locations of overlapped items. 
  
    // Add to new location. 
    this._addAt(item, index.x, index.y, orientation);

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
   * @param {ITEM_ORIENTATIONS} orientation Optional. If not undefined, will only test with that specific 
   * orientation. If left undefined, will test every possible orientation in succession. 
   * @returns {GridPlacementTestResult}
   */
  canItemFitOnGrid(item, orientation = undefined) {
    // If the item is already on grid, we can return early. 
    const index = this.getIndexOf(item);
    if (index !== undefined) {
      return new GridPlacementTestResult(true, index.x, index.y, index.orientation, []);
    }

    const columnCount = Math.min(this._columnCount, this._capactiy);
    
    for (let x = 0; x < columnCount; x++) {
      const rowCount = this._grid[x].length;
      for (let y = 0; y < rowCount; y++) {
        if (orientation !== undefined) {
          // Test with given orientation. 
          const result = this.canItemFitOnGridAt(item, x, y, orientation, false);
          if (result.result === true) return result;
        } else {
          // Test with default (vertical) orientation. 
          let result = this.canItemFitOnGridAt(item, x, y, ITEM_ORIENTATIONS.vertical, false);
          if (result.result === true) return result;
          
          // Test with rotated (horizontal) orientation. 
          result = this.canItemFitOnGridAt(item, x, y, ITEM_ORIENTATIONS.horizontal, false);
          if (result.result === true) return result;
        }
      }
    }
    
    return new GridPlacementTestResult(false, undefined, undefined, undefined, []);
  }
  
  /**
   * Tests if the given item could fit on the item grid at the given coordinates and returns the result, 
   * which contains the grid coordinates and orientation of where it would fit. 
   * @param {AmbersteelItemItem} item 
   * @param {ITEM_ORIENTATIONS} orientation
   * @param {Boolean} allowOverlap Optional. If true, allows for item overlap (must be fully enveloped). Default 'false'
   * @returns {GridPlacementTestResult}
   */
  canItemFitOnGridAt(item, x, y, orientation, allowOverlap = false) {
    // Test if unchanged location and orientation. 
    const index = this.getIndexOf(item);
    if (index !== undefined) {
      if (index.x === x && index.y === y && index.orientation === orientation) {
        return new GridPlacementTestResult(true, index.x, index.y, index.orientation, []);
      }
    }

    const failureResult = new GridPlacementTestResult(false, undefined, undefined, undefined, []);
    const shape = this._getOrientedShape(item.shape, orientation);
    const right = x + shape.width - 1;
    const bottom = y + shape.height - 1;

    // Test for bounds of grid.
    const columnCount = Math.min(this._columnCount, this._capactiy);
    if (right >= columnCount) return failureResult;

    for (let iX = x; iX <= right; iX++) {
      const rowCount = this._grid[iX].length;
      if (bottom >= rowCount) return failureResult;
    }
    
    // Test for overlap. 
    const overlappedItems = this.getItemsOnGridWithin(x, y, shape.width, shape.height);

    // Remove self from overlapped items. 
    for (let i = 0; i < overlappedItems.length; i++) {
      if (overlappedItems[i].item.id === item.id) {
        overlappedItems.splice(i, 1);
        break;
      }
    }

    if (allowOverlap !== true && overlappedItems.length > 0) {
      return failureResult;
    }

    // Test if all of the overlapped items are completely enveloped. 
    // If so, their positions could be switched with that of the tested item. 
    const anyPartial = overlappedItems.find(element => element.isPartial === true);
    if (anyPartial === undefined) {
      return new GridPlacementTestResult(true, x, y, orientation, overlappedItems);
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
        if (itemOnGrid !== null && itemOnGrid !== undefined) {
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
   * Internal method to remove an index from the list of indices. 
   * @param {InventoryIndex} itemIndex 
   * @private
   */
  _removeFromIndex(itemIndex) {
    const index = this._indices.indexOf(itemIndex);
    if (index < 0) return; // The given index does not belong to this item grid. 

    this._indices.splice(index, 1);
  }
  
  /**
   * Internal method to remove an index from the grid. 
   * @param {InventoryIndex} itemIndex 
   * @private
   */
  _removeFromGrid(itemIndex) {
    const x = itemIndex.x;
    const y = itemIndex.y;
    const right = x + itemIndex.w - 1;
    const bottom = y + itemIndex.h - 1;
    
    for (let iX = x; iX <= right; iX++) {
      for (let iY = y; iY <= bottom; iY++) {
        this._grid[iX][iY] = null;
      }
    }
  }

  /**
   * Internal method to remove an index from the list. 
   * @param {TransientAsset} item 
   * @private
   */
  _removeFromList(item) {
    const indexItem = this._items.indexOf(item);
    this._items.splice(indexItem, 1);
  }

  /**
   * Places an item at the given position, with the given orientation, if possible. 
   * 
   * Warning: will override any potentially overlapped items! Intended for internal use, only!
   * @param {TransientAsset} item 
   * @param {Number} x 
   * @param {Number} y 
   * @param {ITEM_ORIENTATIONS} orientation 
   * @private
   */
  _addAt(item, x, y, orientation) {
    const shape = this._getOrientedShape(item.shape, orientation);

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

    // Add to list.
    this._items.push(item);
  }

  /**
   * Returns a shape, based on the given shape and orientation. 
   * 
   * The given shape is not modified, in any way, during this operation. 
   * @param {Object} shape 
   * @param {ITEM_ORIENTATIONS} orientation 
   */
  _getOrientedShape(shape, orientation = undefined) {
    return {
      width: orientation === ITEM_ORIENTATIONS.horizontal ? shape.height : shape.width,
      height: orientation === ITEM_ORIENTATIONS.horizontal ? shape.width : shape.height
    };
  }
}

/**
 * Represents the result of a test whether an item can fit on the item grid. 
 */
export class GridPlacementTestResult {
  /**
   * @param {Boolean} result True, if the item can fit. 
   * @param {Number} x Column on grid where the item can fit. 
   * @param {Number} y Row on grid where the itme can fit. 
   * @param {ITEM_ORIENTATIONS} orientation Which orientation the item must be in to be able to fit. 
   * @param {Array<GridOverlapTestResult>} overlapped An array of overlapped items. 
   * In case of {result} being 'true', the overlapped items are completely enveloped. 
   * In case of {result} being 'false, at least one overlapped item isn't completely enveloped. 
   */
  constructor(result, x, y, orientation, overlapped = []) {
    this.result = result;
    this.x = x;
    this.y = y;
    this.orientation = orientation;
    this.overlapped = overlapped;
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
   * @param {Array<String>} itemsError A list of items that caused errors. 
   */
  constructor(itemGrid, itemsDropped, itemsError) {
    this.itemGrid = itemGrid;
    this.itemsDropped = itemsDropped;
    this.itemsError = itemsError;
  }
}