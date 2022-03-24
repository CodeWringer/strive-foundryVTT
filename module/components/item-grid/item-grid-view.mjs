import { AmbersteelActor } from "../../documents/actor.mjs";
import InventoryIndex from "../../dto/inventory-index.mjs";
import { TEXTURES } from "../../pixi/texture-preloader.mjs";
import { ItemOnGridView } from "./item-on-grid-view.mjs";
import { DragIndicator } from "./drag-indicator.mjs";
import { Button } from "../../pixi/button.mjs";
import { ItemGrid } from "./item-grid.mjs";

/**
 * Represents an item grid (of possessions). 
 */
export class ItemGridView {
  /**
   * This is the element of the DOM that will be "hijacked" to display the {ItemGridView}. 
   * @type {HTMLElement}
   * @private
   */
  _canvasElement = undefined;

  /**
   * @type {PIXI.App}
   * @private
   */
  _pixiApp = undefined;
  /**
   * @type {PIXI.Stage}
   * @private
   */
  _stage = undefined;
  /**
   * @type {PIXI.Container}
   * @private
   */
  _rootContainer = undefined;
  /**
   * Contains the sprites that represent the slot grid. 
   * @type {Array<PIXI.Sprite>}
   * @private
   */
  _spriteInstancesGrid = [];
  /**
   * Contains the item root containers. 
   * @type {Array<PIXI.Container>}
   * @private
   */
  _itemsOnGrid = [];

  /**
   * The underlying {ItemGrid} instance that this is a view on. 
   * @type {ItemGrid}
   * @private
   */
  _itemGrid = undefined;
    
  /**
   * @type {ItemOnGridView}
   * @private
   */
  _dragItem = undefined;
  /**
   * @type {DragIndicator}
   * @private
   */
  _dragIndicator = undefined;

  /**
   * Width of the canvas element in pixels. 
   * @type {Number}
   * @private
   */
  _width = 0;

  /**
   * Size of a tile on the grid, in pixels. 
   * @type {Number}
   * @default 128
   * @private
   */
  _tileSize = 128;

  /**
   * If true, is capturing pointer (mouse and touch) events. 
   * @type {Boolean}
   * @private
   */
  _captureCursor = false;

  /**
   * If set to true, will draw debug info. 
   * @type {Boolean}
   * @private
   */
  _drawDebug = false;
  get drawDebug() { return this._drawDebug; }
  set drawDebug(value) {
    this._drawDebug = value;
    for (const itemOnGrid of this._itemsOnGrid) {
      itemOnGrid.drawDebug = !itemOnGrid.drawDebug;
    }
  }
  
  /**
   * If not undefined, the currently being dragged item. 
   * @type {ItemOnGridView|undefined}
   * @private
   */
  _hoverItem = undefined;
  get hoverItem() { return this._hoverItem; }
  set hoverItem(value) {
    if (this.isEditable !== true) return;

    if (value != this.hoverItem) {
      if (this.hoverItem !== undefined) {
        this.hoverItem.tint = 0xFFFFFF; // Removes any highlighting. 
      }
    }

    this._hoverItem = value;

    if (this.hoverItem !== undefined) {
      this.hoverItem.tint = 0xfcecde; // Sets a highlight. TODO: Make prettier than a tint. 
    }
  }

  /**
   * @type {Button}
   * @private
   */
  _hoverButton = undefined;
  get hoverButton() { return this._hoverButton; }
  set hoverButton(value) {
    if (this.isEditable !== true) return;

    if (value != this._hoverButton) {
      if (this.hoverButton !== undefined) {
        this._hoverButton.showHover = false;
      }
    }
    
    this._hoverButton = value;
    
    if (this._hoverButton !== undefined) {
      this._hoverButton.showHover = true;
    }
  }

  /**
   * @type {Boolean}
   * @private
   */
  _isEditable = true;
  /**
   * Returns true, if the item grid is editable.
   * @type {Boolean}
   */
  get isEditable() { return this._isEditable; }
  /**
   * Sets whether the item grid is editable.
   * @param {Boolean} value
   */
  set isEditable(value) {
    this._isEditable = value;
    if (value !== true) {
      this.hoverItem = undefined;
      this.hoverButton = undefined;
    }
  }

  /**
   * @param {HTMLElement} html DOM that containes the canvas element. 
   * @param {String} canvasElementId ID of the DOM element that represents the canvas. 
   * @param {ItemGrid} itemGrid The item grid to display. 
   * @param {Number} width Width of the canvas, in pixels. 
   * @param {Number} tileSize Optional. Size of a tile, in pixels. 
   * @param {Boolean} isEditable Optional. Determines whether the item grid will be editable. Default false. 
   */
  constructor(html, canvasElementId, itemGrid, width, tileSize = 128, isEditable = false) {
    this._width = width;
    this._tileSize = tileSize;
    this._itemGrid = itemGrid;
    this._isEditable = isEditable;

    // Setup HTML canvas element. 
    this._canvasElement = html.find("#" + canvasElementId)[0];
    const height = Math.ceil(this._itemGrid.capacity / this._itemGrid.columnCount) * this._tileSize;
    this._canvasElement.style.height = height;
  
    // Setup Pixi app. 
    this._pixiApp = new PIXI.Application({
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      backgroundAlpha: 0,
      width: this._width,
      height: height
    });

    this._canvasElement.appendChild(this._pixiApp.view);
    this._stage = this._pixiApp.stage;
  
    this._rootContainer = new PIXI.Container();
    this._stage.addChild(this._rootContainer);
  
    // Setup drag indicator. 
    this._dragIndicator = new DragIndicator(this._pixiApp, this._tileSize);

    this._setupTiles(this._itemGrid.grid, this._tileSize);
    this._setupItemsOnGrid(this._itemGrid.indices, this._itemGrid.items);
    this._setupInteractivity();
  }
  
  /**
   * Sets up the grid background tiles. 
   * @param {Array<Array<InventoryIndex | null>>} grid
   * @param {Number} tileSize Size of a tile, in pixels. 
   * @private
   */
  _setupTiles(grid, tileSize) {
    const columnCount = grid.length;
    for (let x = 0; x < columnCount; x++) {
      const rowCount = grid[x].length;
      for (let y = 0; y < rowCount; y++) {
        const spriteItemSlot = PIXI.Sprite.from(TEXTURES.ITEM_SLOT);
        spriteItemSlot.width = tileSize;
        spriteItemSlot.height = tileSize;
        spriteItemSlot.x = x * tileSize;
        spriteItemSlot.y = y * tileSize;
        spriteItemSlot.alpha = 0.5;
        this._spriteInstancesGrid.push(spriteItemSlot);
        this._rootContainer.addChild(spriteItemSlot);
      }
    }
  }
  
  /**
   * Sets up the initial set of items. 
   * @param {Array<InventoryIndex>} indices
   * @param {Array<InventoryIndex>} items
   * @private
   */
  _setupItemsOnGrid(indices, items) {
    for (const index of indices) {
      const item = items.find((element) => { return element.id === index.id; });
      const itemOnGrid = new ItemOnGridView(item, index, { width: this._tileSize, height: this._tileSize }, this, this.isEditable);
      this._itemsOnGrid.push(itemOnGrid);

      this._rootContainer.addChild(itemOnGrid.rootContainer.wrapped);
      itemOnGrid.x = index.x * this._tileSize;
      itemOnGrid.y = index.y * this._tileSize;
    }
  }

  /**
   * Sets up interactivity. 
   * @private
   */
  _setupInteractivity() {
    window.addEventListener('keypress', (e) => {
      if (e.code != "KeyR") return; // TODO #45: Add this to FoundryVTT's key map somehow. 

      if (this._dragItem !== undefined) {
        this._dragIndicator.rotate();
        this._dragIndicator.valid = this._itemGrid.canItemFitOnGridAt(
          this._dragItem.item,
          this._dragIndicator.targetOnGrid.x,
          this._dragIndicator.targetOnGrid.y,
          this._dragIndicator.orientation
        ).result;
      }
    });

    // Make PIXI stage capture pointer (mouse or touch) events. 
    this._stage.interactive = true;
    this._stage.interactiveChildren = true;

    this._stage.on("pointerdown", (event) => {
      const coords = { x: event.data.global.x, y: event.data.global.y };
      const itemOnGrid = this.getItemAt(coords.x, coords.y);
      const button = this._getButtonAt(coords.x, coords.y);

      if (button !== undefined) {
        if (button.requiresEditPermission === true && this.isEditable !== true) return;
        button.callback();
      } else if (itemOnGrid !== undefined) {
        if (this.isEditable !== true) return;

        // Start dragging. 

        this._canvasElement.style.cursor = "grabbing";

        this.hoverItem = itemOnGrid;
        this._dragItem = itemOnGrid;

        this._dragIndicator.setSize(itemOnGrid.index.w, itemOnGrid.index.h, this._dragItem.index.orientation);
        this._dragIndicator.setInitialTo(itemOnGrid.index.x, itemOnGrid.index.y);
        this._dragIndicator.setTargetTo(itemOnGrid.index.x, itemOnGrid.index.y);
        this._dragIndicator.show = true;
        this._dragIndicator.valid = this._itemGrid.canItemFitOnGridAt(
          itemOnGrid.item,
          itemOnGrid.index.x,
          itemOnGrid.index.y,
          this._dragIndicator.orientation
        ).result;
      }
    });

    this._stage.on("pointerup", (event) => {
      if (this.isEditable !== true) return;

      const coords = { x: event.data.global.x, y: event.data.global.y };

      if (this._dragItem !== undefined) {
        const gridCoords = this.getGridCoordsAt(coords.x, coords.y);

        const canItemBeMovedTo = this._itemGrid.canItemFitOnGridAt(
          this._dragItem.item,
          gridCoords.x,
          gridCoords.y,
          this._dragIndicator.orientation
        );
        if (canItemBeMovedTo.result === true) {
          // Move (and rotate) item. 
          this._itemGrid.move(this._dragItem.item, gridCoords.x, gridCoords.y, this._dragIndicator.orientation);
          this._itemGrid.synchronize();
        }

        // Unset currently dragged item. 
        this._dragItem = undefined;
        // Hide drag indicator. 
        this._dragIndicator.show = false;
      }
      
      this._determineCursor(coords.x, coords.y);
    });
    
    this._stage.on("pointerover", (event) => {
      this._captureCursor = true;
    });

    this._stage.on("pointerout", (event) => {
      this._captureCursor = false;

      if (this._dragItem === undefined) {
        // Unset current hover item. 
        this.hoverItem = undefined;
        // Unset current hover button. 
        this.hoverButton = undefined;
      }
    });

    this._stage.on("pointermove", (event) => {
      if (this._captureCursor !== true) return;
      if (this._isEditable !== true) return;
      const coords = { x: event.data.global.x, y: event.data.global.y };

      if (this._dragItem === undefined) {
        const itemOnGrid = this.getItemAt(coords.x, coords.y);
        const button = this._getButtonAt(coords.x, coords.y);
        
        this.hoverItem = itemOnGrid;
        this.hoverButton = button;
        
        this._determineCursor(coords.x, coords.y);
      } else {
        const gridCoords = this.getGridCoordsAt(coords.x, coords.y);
        this._dragIndicator.valid = this._itemGrid.canItemFitOnGridAt(
          this._dragItem.item,
          gridCoords.x,
          gridCoords.y,
          this._dragIndicator.orientation
        ).result;

        this._dragIndicator.setTargetTo(gridCoords.x, gridCoords.y);
      }
    });
  }

  /**
   * Clean-up of the item grid. 
   */
  dispose() {
    // Tear down pixiApp
    this._stage = undefined;
    if (this._pixiApp !== undefined) {
      this._pixiApp.destroy();
    }
    this._pixiApp = undefined;
    this._rootContainer = undefined;

    // Unset variables (probably unnecessary, but better to be on the safe side). 
    this.itemGrid = undefined;
    this._spriteInstancesGrid = [];
    this._itemsOnGrid = [];

    if (this._dragIndicator !== undefined) {
      this._dragIndicator.destroy();
    }
  }

  /**
   * Returns the grid coordinates containing the given pixel coordinates. 
   * @param {Number} pixelX X coordinate, in pixels. 
   * @param {Number} pixelY Y coordinate, in pixels. 
   * @returns {Object} { x: {Number}, y: {Number} } Grid coordinates
   */
  getGridCoordsAt(pixelX, pixelY) {
    return {
      x: Math.floor(pixelX / this._tileSize),
      y: Math.floor(pixelY / this._tileSize)
    }
  }
  
  /**
   * Returns the item whose bounding rectangle contains the given pixel coordinates. 
   * @param {Number} pixelX X pixel coordinate. 
   * @param {Number} pixelY Y pixel coordinate. 
   * @returns {ItemOnGridView | undefined}
   */
  getItemAt(pixelX, pixelY) {
    for (const itemOnGrid of this._itemsOnGrid) {
      if (itemOnGrid.rectangle.contains(pixelX, pixelY) === true) {
        return itemOnGrid;
      }
    }
    return undefined;
  }

  /**
   * Returns the button whose bounding rectangle contains the given pixel coordinates. 
   * @param {Number} pixelX X pixel coordinate. 
   * @param {Number} pixelY Y pixel coordinate. 
   * @returns {Button | undefined}
   * @private
   */
  _getButtonAt(pixelX, pixelY) {
    for (const itemOnGrid of this._itemsOnGrid) {
      const button = itemOnGrid.getButtonAt(pixelX, pixelY);
      if (button !== undefined) {
        return button;
      }
    }
    return undefined;
  }

  /**
   * Sets the cursor's appearance, based on the context-dependent interaction 
   * possible at the given pixel coordinates. 
   * @param {Number} pixelX X coordinate, in pixels. 
   * @param {Number} pixelY Y coordinate, in pixels. 
   * @private
   */
  _determineCursor(pixelX, pixelY) {
    const itemOnGrid = this.getItemAt(pixelX, pixelY);
    const button = this._getButtonAt(pixelX, pixelY);
    
    if (this.isEditable === true && button !== undefined) {
      // Show clicking is possible. 
      this._canvasElement.style.cursor = "pointer";
    } else if (this.isEditable === true && itemOnGrid !== undefined) {
      // Show grabbing is possible. 
      this._canvasElement.style.cursor = "grab";
    } else {
      // No interaction possible at current pixel coordinates. 
      this._canvasElement.style.cursor = "default";
    }
  }
}
