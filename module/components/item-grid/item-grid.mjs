import { AmbersteelActor } from "../../documents/actor.mjs";
import AmbersteelItemItem from "../../documents/subtypes/item/ambersteel-item-item.mjs";
import InventoryIndex from "../../dto/inventory-index.mjs";

/**
 * Default column count used to initialize new a item grid. 
 * @type {Number}
 * @constant
 */
export const COLUMN_COUNT = 4;

export class ItemGrid {
  /**
   * @type {Array<InventoryIndex>}
   * @private
   */
  _indices = [];
  /**
   * @type {Array<InventoryIndex>}
   * @readonly
   */
  get indices() { return this._indices; }

  /**
   * Two-dimensional array, which represents the item grid. 
   * @type {Array<Array<InventoryIndex | null>>}
   */
  _grid = [];
  /**
   * Two-dimensional array, which represents the item grid. 
   * @type {Array<Array<InventoryIndex | null>>}
   * @readonly
   */
  get grid() { return this._grid; }

  /**
   * @type {Number}
   * @private
   */
  _columnCount = 0;
  /**
   * @type {Number}
   * @readonly
   */
  get columnCount() { return this._columnCount; }
  
  /**
   * @type {Number}
   * @private
   */
  _capactiy = 0;
  /**
   * @type {Number}
   * @readonly
   */
  get capacity() { return this._capactiy; }

  /**
   * Instantiates an empty item grid. 
   * @param {Number} columnCount Number of columns the grid will have. 
   * @param {Number} capacity Number of slots (tiles) the item grid will have. 
   */
  constructor(columnCount, capacity) {
    this._columnCount = columnCount;
    this._capactiy = capacity;

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
   * Returns a new {ItemGrid}, based on the given actor's {data.data.assets.grid} and {data.data.assets.gridIndices}.
   * @param {AmbersteelActor} actor 
   * @returns {ItemGrid}
   */
  static from(actor) {
    const grid = actor.data.data.assets.grid;
    const capacity = actor.data.data.assets.maxBulk;
    // The column count will 0 for unitialized grids, which haven't yet been persisted to the db. 
    const columnCount = COLUMN_COUNT;

    const itemGrid = new ItemGrid(columnCount, capacity);

    // Place existing items on grid.  
    const indices = actor.data.data.assets.gridIndices;
    for (const index of indices) {
      const item = actor.items.get(index.id);
      // Assuming the grid is well-formed, we don't have to do any validation. 
      itemGrid._addAt(item, index.x, index.y, index.orientation);
    }

    // Place new items on grid. 
    const items = actor.possessions;
    for (const item of items) {
      if (itemGrid.contains(item)) continue;

      try {
        itemGrid.add(item);
      } catch (error) {
        console.warn(error);
        // TODO: Show warning pop-up?
      }
    }

    return itemGrid;
  }
  
  /**
   * Places an item at the given position, with the given orientation, if possible. 
   * 
   * Warning: will override any potentially overlapped items!
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

  _getOrientedShape(shape, orientation = undefined) {
    return {
      width: orientation === game.ambersteel.config.itemOrientations.horizontal ? shape.height : shape.width,
      height: orientation === game.ambersteel.config.itemOrientations.horizontal ? shape.width : shape.height
    };
  }

  /**
   * Places an item at the given position, with the given orientation, if possible. 
   * 
   * Throws an error, if the item couldn't be placed. 
   * @param {AmbersteelItemItem} item 
   * @param {Number} x 
   * @param {Number} y 
   * @param {CONFIG.itemOrientations} orientation 
   * @throws If the item couldn't be placed at the given coordinates. 
   */
  addAt(item, x, y, orientation = undefined) {
    const fit = this.canItemFitOnGridAt(item, x, y, orientation);
    if (fit.result !== true) {
      throw `Couldn't place item on grid at: x: ${x}, y: ${y}, orientation: ${orientation}`;
    }
    
    const shape = this._getOrientedShape(item.data.data.shape, orientation);
    this._addAt(item, x, y, shape.width, shape.height, fit.orientation);
  }
  
  /**
   * Adds the given item to the next free slot on the grid, with the given orientation, if possible. 
   * 
   * Throws an error, if the item couldn't be placed. 
   * @param {AmbersteelItemItem} item 
   * @param {CONFIG.itemOrientations} orientation Optional. If left undefined, will rotate the item as needed 
   * to fit it on grid. If defined, will only use that orientation. 
   * @throws If the item couldn't be placed anywhere on the grid. 
   */
  add(item, orientation = undefined) {
    const fit = this.canItemFitOnGrid(item, orientation);
    if (fit.result !== true) {
      throw `Couldn't fit item on grid with orientation: ${orientation}`;
    }
    
    const shape = this._getOrientedShape(item.data.data.shape, orientation);
    this._addAt(item, fit.x, fit.y, shape.width, shape.height, fit.orientation);
  }
  
  /**
   * Removes the given item from the grid, if possible. 
   * @param {AmbersteelItemItem} item 
   */
  remove(item) {
    const itemIndex = this.getIndexOf(item);

    if (itemIndex === undefined) {
      console.warn(`Item '${item.id}' could not be removed, because it had no index!`);
      return;
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
   * Updates the given actor's item grid based on this {ItemGrid}. 
   * @param {AmbersteelActor} actor 
   * @param {Boolean} update If true, will push the changes to the db. Default true. 
   */
  synchronizeTo(actor, update = true) {
    if (update === true) {
      actor.update({
        data: {
          assets: {
            grid: this._grid,
            gridIndices: this._indices
          }
        }
      });
    } else {
      // This data will *not* be persisted!
      // When an actor is initialized, its grid may be empty. This is the case with new actors. 
      // The ItemGrid and ItemGridView classes expect an initialized grid, however. 
      // In that case, the empty grid will be initialized, so it has the correct number of 
      // columns and rows. 
      // Since updating an actor's db entry causes it to be re-rendered, this causes an 
      // unnecessary chain-reaction of initializations to occur, which would result in infinite recursion. 
      actor.data.data.assets.grid = this._grid;
      actor.data.data.assets.gridIndices = this._indices;
    }
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
