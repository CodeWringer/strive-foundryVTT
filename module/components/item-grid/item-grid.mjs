import { AmbersteelActor } from "../../documents/actor.mjs";
import { ActorEvents } from "../../documents/actor.mjs";
import InventoryIndex from "../../dto/inventory-index.mjs";
import AmbersteelBaseActorSheet from "../../sheets/subtypes/actor/ambersteel-base-actor-sheet.mjs";
import { TEXTURES } from "./texture-preloader.mjs";
import { ItemOnGrid } from "./item-on-grid.mjs";

const WIDTH = 550; // This magic constant is based on the assumption that the actor sheet is about 560px wide. 
const MAX_COLUMNS = 4;
const TILE_SIZE = Math.floor(WIDTH / MAX_COLUMNS);

function MOCK_ACTOR_SHEET() { return {
  getActor() { return this.actor; },
  actor: {
    possessions: [
      { id: "Ab1", name: "Crowns", img: "icons/svg/item-bag.svg", data: { data: { description: "That which greases palms.", gmNotes: "", isCustom: false, quantity: 1, maxQuantity: 100, bulk: 1, shape: { width: 1, height: 1 }, isOnPerson: true } } },
      { id: "Ab2", name: "Longsword", img: "icons/svg/item-bag.svg", data: { data: { description: "This is a two-handed bladed weapon.", gmNotes: "", isCustom: false, quantity: 1, maxQuantity: undefined, bulk: 2, shape: { width: 1, height: 2 }, isOnPerson: true } } },
      { id: "Ab3", name: "Axe", img: "icons/svg/item-bag.svg", data: { data: { description: "This is a two-handed bladed weapon.", gmNotes: "", isCustom: false, quantity: 1, maxQuantity: undefined, bulk: 2, shape: { width: 1, height: 2 }, isOnPerson: true } } },
    ],
    maxBulk: 9,
    on() {},
    off() {},
    offAll() {},
    once() {},
    data: {
      data: {
        assets: {
          inventory: [
            new InventoryIndex({ x: 0, y: 0, w: 1, h: 1, id: "Ab1", orientation: game.ambersteel.config.itemOrientations.vertical }),
            new InventoryIndex({ x: 1, y: 0, w: 1, h: 2, id: "Ab2", orientation: game.ambersteel.config.itemOrientations.vertical }),
            new InventoryIndex({ x: 2, y: 0, w: 2, h: 1, id: "Ab3", orientation: game.ambersteel.config.itemOrientations.horizontal }),
          ]
        }
      }
    }
  }
}};

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
   * @type {AmbersteelBaseActorSheet}
   * @private
   */
  _actorSheet = undefined;
  /**
   * @type {AmbersteelActor}
   * @private
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
   * @param {Boolean} mock
   */
  constructor(html, canvasElementId, actorSheet, mock = true) {
    const usedActorSheet = mock ? MOCK_ACTOR_SHEET() : actorSheet;

    this._actorSheet = usedActorSheet;
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
      backgroundAlpha: 0,
      width: WIDTH,
      height: height
    });

    canvasElement.appendChild(this._pixiApp.view);
    this._stage = this._pixiApp.stage;
  
    this._rootContainer = new PIXI.Container();
    this._stage.addChild(this._rootContainer);
  
    this._setupTiles();
  
    const indices = this._actor.data.data.assets.inventory; // A list of {InventoryIndex}
    const items = this._actor.possessions; // A list of {AmbersteelItemItem}
    this._setupItemsOnGrid(indices, items);
    
    this._setupInteractivity();
  }
  
  // TODO: Custom events might not be necessary, after all. Since adding or removing updates the 
  // actor in question, it re-renders the actor sheet and thus updates the item grid. 
  // Moving items around might also cause an automatic re-render. 
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
      const spriteItemSlot = PIXI.Sprite.from(TEXTURES.ITEM_SLOT);
      spriteItemSlot.width = TILE_SIZE;
      spriteItemSlot.height = TILE_SIZE;
      spriteItemSlot.x = x * TILE_SIZE;
      spriteItemSlot.y = y * TILE_SIZE;
      spriteItemSlot.alpha = 0.5;
      this._spriteInstancesGrid.push(spriteItemSlot);
      this._rootContainer.addChild(spriteItemSlot);
  
      x++;
      if (x == MAX_COLUMNS) {
        x = 0;
        y++;
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
      const itemOnGrid = new ItemOnGrid(item, { width: TILE_SIZE, height: TILE_SIZE }, this._pixiApp);
      this._itemsOnGrid.push(itemOnGrid);

      this._rootContainer.addChild(itemOnGrid.rootContainer.wrapped);
      itemOnGrid.x = index.x * TILE_SIZE;
      itemOnGrid.y = index.y * TILE_SIZE;
    }
  }

  /**
   * Sets up interactivity. 
   * @private
   */
  _setupInteractivity() {
    this._stage.interactive = true;
    this._stage.on("pointerdown", () => {
      console.log("clicked!");
      for (const itemOnGrid of this._itemsOnGrid) {
        itemOnGrid.showDebug = !itemOnGrid.showDebug;
      }
    });
    this._stage.on("pointermove", (event) => {
      console.log(event);
    });

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
    this._unregisterEvents();
  
    // Tear down pixiApp
    this._stage = undefined;
    this._pixiApp.destroy();
    this._pixiApp = undefined;
    this._rootContainer = undefined;

    // Unset variables (probably unnecessary, but better to be on the safe side). 
    this._actorSheet = undefined;
    this._actor = undefined;
    this._spriteInstancesGrid = [];
    this._itemsOnGrid = [];
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
