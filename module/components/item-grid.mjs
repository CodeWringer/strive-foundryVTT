import { AmbersteelActor } from "../documents/actor.mjs";
import { ActorEvents } from "../documents/actor.mjs";
import AmbersteelBaseActorSheet from "../sheets/subtypes/actor/ambersteel-base-actor-sheet.mjs";

const WIDTH = 550;
const MAX_COLUMNS = 6;
const TILE_SIZE = Math.floor(WIDTH / MAX_COLUMNS);
const PATH_TEXTURE_ITEM_SLOT = "systems/ambersteel/images/box.png";

const TEXTURE_ITEM_SLOT = PIXI.Texture.from(PATH_TEXTURE_ITEM_SLOT);

/**
 * Represents an item grid (of possessions). 
 * @property {Number} tileCount Total number of tiles on grid. 
 */
export class ItemGrid {
  /**
   * List of registered event listeners.
   * @type {Object}
   * @private
   */
  _eventListeners = {};

  /**
   * @type {PIXI.App}
   */
  _pixiApp = undefined;
  /**
   * @type {PIXI.Stage}
   */
  _stage = undefined;
  /**
   * @type {PIXI.Container}
   */
  _container = undefined;
  /**
   * @type {Array<PIXI.Sprite>}
   */
  _sprites = [];

  /**
   * @type {AmbersteelBaseActorSheet}
   */
  _actorSheet = undefined;
  /**
   * @type {AmbersteelActor}
   */
  _actor = undefined;

  /**
   * Total number of tiles on grid. 
   * @type {Number}
   */
  tileCount = 0;

  /**
   * 
   * @param {HTMLElement} html 
   * @param {String} canvasElementId 
   * @param {AmbersteelBaseActorSheet} actorSheet 
   */
  constructor(html, canvasElementId, actorSheet) {
    this._actorSheet = actorSheet;
    this._actor = this._actorSheet.getActor();
    this.tileCount = this._actor.maxBulk;

    this._registerEvents(this._actor);
    
    // Setup HTML canvas element. 
    const canvasElement = html.find("#" + canvasElementId)[0];
    const height = Math.ceil(this.tileCount / MAX_COLUMNS) * TILE_SIZE;
    canvasElement.style.height = height;
  
    // Setup Pixi app. 
    this._pixiApp = new PIXI.Application({
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      backgroundColor: 0x6495ed, // TODO: Make transparent
      width: WIDTH,
      height: height
    });
    canvasElement.appendChild(this._pixiApp.view);
    this._stage = this._pixiApp.stage;
  
    this._container = new PIXI.Container();
    this._stage.addChild(this._container);
  
    this._setupTiles();
  
    this._setupItemsOnGrid();
    
    this._setupInteractivity();
  }
  
  /**
   * Registers event listeners. 
   * @private
   */
  _registerEvents() {
    this._eventListeners.possessionAdded = this._actor.on(ActorEvents.possessionAdded, (item) => {
      // TODO: Add to grid. 
    });
    this._eventListeners.possessionRemoved = this._actor.on(ActorEvents.possessionRemoved, (item) => {
      // TODO: Remove from grid. 
    });
    this._eventListeners.possessionUpdated = this._actor.on(ActorEvents.possessionUpdated, (item) => {
      /* TODO: Update item on grid.
      * If *any* of visble the properties of the item changed, 
      * that change has to be applied to the object on canvas, as well. 
      */
    });
  }
  
  /**
   * Sets up the grid background tiles. 
   * @private
   */
  _setupTiles() {
    let x = 0;
    let y = 0;
  
    for (let i = 0; i < this.tileCount; i++) {
      const spriteItemSlot = PIXI.Sprite.from(TEXTURE_ITEM_SLOT);
      spriteItemSlot.w = TILE_SIZE;
      spriteItemSlot.h = TILE_SIZE;
      spriteItemSlot.x = x * TILE_SIZE;
      spriteItemSlot.y = y * TILE_SIZE;
      this._sprites.push(spriteItemSlot);
      this._container.addChild(spriteItemSlot);
  
      x++;
      if (x == MAX_COLUMNS) {
        x = 0;
        y++;
      }
    }
  }
  
  /**
   * Sets up the initial set of items. 
   * @private
   */
  _setupItemsOnGrid() {
    // TODO: Place every possession on the grid. 
    // Must work with actor.data.data.assets.inventory, which is a list of {InventoryIndex}
  }
  
  /**
   * Sets up interactivity. 
   * @private
   */
  _setupInteractivity() {
    this._pixiApp.ticker.add((delta) => {
      // TODO: Test events for items on grid. 
      // TODO: Item hover. 
      // TODO: Item dragging on grid. 
      // TODO: Interactivity on item:
        // - sendToChat
        // - delete
        // - update property (this might be a bit too much work - probably requires 
        // custom implementation of input field, but as an object on canvas)
    });
  }
  
  /**
   * Clean-up of the item grid. 
   */
  tearDown() {
    _unregisterEvents();
  
    // TODO: Tear down pixiApp
  }
  
  /**
   * Un-registers all event listeners. 
   * @private
   */
  _unregisterEvents() {
    for (const eventListener in this._eventListeners) {
      this._actor.off(eventListener);
    }
  }
}
