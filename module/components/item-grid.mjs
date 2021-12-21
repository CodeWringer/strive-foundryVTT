import { AmbersteelActor } from "../documents/actor.mjs";
import { ActorEvents } from "../documents/actor.mjs";
import InventoryIndex from "../dto/inventory-index.mjs";
import AmbersteelBaseActorSheet from "../sheets/subtypes/actor/ambersteel-base-actor-sheet.mjs";

const WIDTH = 550;
const MAX_COLUMNS = 4;
const TILE_SIZE = Math.floor(WIDTH / MAX_COLUMNS);
const PATH_TEXTURE_ITEM_SLOT = "systems/ambersteel/images/box.png";
const PATH_TEXTURE_ITEM_BULK = "systems/ambersteel/images/weight-hanging-solid.svg";

const _loader = new PIXI.Loader();
const _textures = {};

_loader.add("itemSlot", PATH_TEXTURE_ITEM_SLOT);
_loader.add("itemBulk", PATH_TEXTURE_ITEM_BULK);

_loader.load((loader, resources) => {
  _textures.TEXTURE_ITEM_SLOT = resources.itemSlot.texture,
  _textures.TEXTURE_ITEM_BULK = resources.itemBulk.texture
});

const FONT_FAMILY = "Black-Chancery";

const TEXT_SETTINGS_TITLE = {fontFamily : FONT_FAMILY, fontSize: 18, fill : 0x191813, align : 'center'};
const TEXT_SETTINGS_NORMAL = {fontFamily : FONT_FAMILY, fontSize: 14, fill : 0x191813, align : 'center'};
const TEXT_SETTINGS_INVERSE = {fontFamily : FONT_FAMILY, fontSize: 14, fill : 0xffffff, align : 'center'};
const TEXT_SETTINGS_INVERSE_TITLE = {fontFamily : FONT_FAMILY, fontSize: 18, fill : 0xffffff, align : 'center'};

const PADDING = { x: 6, y: 6 };

function MOCK_ACTOR_SHEET() { return {
  getActor() { return this.actor; },
  actor: {
    possessions: [
      { id: "Ab1", name: "Crowns", img: "", data: { data: { description: "That which greases palms.", gmNotes: "", isCustom: false, quantity: 1, maxQuantity: 100, bulk: 1, shape: { width: 1, height: 1 }, isOnPerson: true } } },
      { id: "Ab2", name: "Longsword", img: "", data: { data: { description: "This is a two-handed bladed weapon.", gmNotes: "", isCustom: false, quantity: 1, maxQuantity: undefined, bulk: 2, shape: { width: 1, height: 2 }, isOnPerson: true } } },
      { id: "Ab3", name: "Axe", img: "", data: { data: { description: "This is a two-handed bladed weapon.", gmNotes: "", isCustom: false, quantity: 1, maxQuantity: undefined, bulk: 2, shape: { width: 1, height: 2 }, isOnPerson: true } } },
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
   */
  _pixiApp = undefined;
  /**
   * @type {PIXI.Stage}
   */
  _stage = undefined;
  /**
   * @type {PIXI.Container}
   */
  _rootContainer = undefined;
  /**
   * Contains the sprites that represent the slot grid. 
   * @type {Array<PIXI.Sprite>}
   */
  _spriteInstancesGrid = [];
  /**
   * Contains the item root containers. 
   * @type {Array<PIXI.Container>}
   */
  _itemsOnGrid = [];

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
  
    // TODO: Must work with actor.data.data.assets.inventory, which is a list of {InventoryIndex}

    const indices = this._actor.data.data.assets.inventory;
    const items = this._actor.possessions;
    this._setupItemsOnGrid(indices, items);
    
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
      const spriteItemSlot = PIXI.Sprite.from(_textures.TEXTURE_ITEM_SLOT);
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
    // TODO: Place every possession on the grid. 
    for (const index of indices) {
      const item = items.find((element) => { return element.id === index.id; });
      const itemOnGrid = this._setupItem(item);
      this._itemsOnGrid.push(itemOnGrid);

      this._rootContainer.addChild(itemOnGrid);
      itemOnGrid.x = index.x * TILE_SIZE;
      itemOnGrid.y = index.y * TILE_SIZE;
    }
  }

  _setupItem(item) {
    const rootContainer = new PIXI.Container();
    const shape = item.data.data.shape;

    const rootSize = { w: shape.width * TILE_SIZE, h: shape.height * TILE_SIZE };
    const contentBox = { 
      x: PADDING.x,
      y: PADDING.y,
      w: rootSize.w - (PADDING.x * 2), 
      h: rootSize.h - (PADDING.y * 2) 
    };

    // Background sprite.
    const spriteBackground = new PIXI.Sprite.from(_textures.TEXTURE_ITEM_SLOT);
    rootContainer.addChild(spriteBackground);

    spriteBackground.width = rootSize.w;
    spriteBackground.height = rootSize.h;
    
    // Content container. 
    const contentContainer = new PIXI.Container();
    rootContainer.addChild(contentContainer);

    contentContainer.x = contentBox.x;
    contentContainer.y = contentBox.y;

    // Icon sprite. 
    const spriteIcon = new PIXI.Sprite.from(_textures.TEXTURE_ITEM_BULK);
    // container.addChild(spriteIcon);

    // Name.
    const textName = new PIXI.Text(item.name, TEXT_SETTINGS_TITLE);
    contentContainer.addChild(textName);
    textName.x = (contentBox.w / 2) - (textName.width / 2);
    textName.y = contentBox.h - textName.height;
    
    // Quantity.
    

    // Bulk.
    const containerBulk = new PIXI.Container();
    const sizeBulk = 24;
    const rectBulk = new Rectangle(contentBox.w - sizeBulk, contentBox.h - sizeBulk, sizeBulk, sizeBulk);

    const spriteBulk = new PIXI.Sprite.from(_textures.TEXTURE_ITEM_BULK);
    spriteBulk.width = sizeBulk;
    spriteBulk.height = sizeBulk;
    containerBulk.addChild(spriteBulk);

    const textBulk = new PIXI.Text(item.data.data.bulk, TEXT_SETTINGS_INVERSE_TITLE);
    containerBulk.addChild(textBulk);
    centerOn(textBulk, rectBulk, true);
    textBulk.y = textBulk.y + 3;

    contentContainer.addChild(containerBulk);
    containerBulk.x = contentBox.w - sizeBulk;

    // Delete/Remove button.

    // SendToChat button. 

    // OpenSheet button. 

    // Calculate size, based on children's bounds. 
    contentContainer.calculateBounds();

    return rootContainer;
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
    this._unregisterEvents();
  
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

/**
 * Centers the given PIXI.DisplayObject on the given bounds rectangle. 
 * @param {PIXI.DisplayObject} displayObject A Sprite to center. 
 * @param {Rectangle} rectangle A rectangle that represents the bounds to center on. 
 * @param {Boolean} isRelative If true, will return a relative offset to the rectangle. 
 */
function centerOn(displayObject, rectangle, isRelative = false) {
  centerOnX(displayObject, rectangle, isRelative);
  centerOnY(displayObject, rectangle, isRelative);
}

/**
 * Horizontally centers the given PIXI.DisplayObject on the given bounds rectangle. 
 * @param {PIXI.DisplayObject} displayObject A Sprite to center. 
 * @param {Rectangle} rectangle A rectangle that represents the bounds to center on. 
 * @param {Boolean} isRelative If true, will return a relative offset to the rectangle. 
 */
function centerOnX(displayObject, rectangle, isRelative = false) {
  displayObject.x = (rectangle.w / 2) - (displayObject.width / 2);

  if (!isRelative) {
    displayObject.x = displayObject.x + rectangle.x;
  }
}

/**
 * Horizontally centers the given PIXI.DisplayObject on the given bounds rectangle. 
 * @param {PIXI.DisplayObject} displayObject A Sprite to center. 
 * @param {Rectangle} rectangle A rectangle that represents the bounds to center on. 
 * @param {Boolean} isRelative If true, will return a relative offset to the rectangle. 
 */
function centerOnY(displayObject, rectangle, isRelative = false) {
  displayObject.y = (rectangle.h / 2) - (displayObject.height / 2);

  if (!isRelative) {
    displayObject.y = displayObject.y + rectangle.y;
  }
}

class Rectangle {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  get width() { return this.w; }
  get height() { return this.h; }
  get position() { return { x: this.x, y: this.y }; }
  get size() { return { w: this.w, h: this.h }; }
}