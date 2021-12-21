import { AmbersteelActor } from "../documents/actor.mjs";
import { ActorEvents } from "../documents/actor.mjs";
import AmbersteelItemItem from "../documents/subtypes/item/ambersteel-item-item.mjs";
import InventoryIndex from "../dto/inventory-index.mjs";
import { centerOn, getProportionalMaxSize } from "../pixi/pixi-utility.mjs";
import AmbersteelBaseActorSheet from "../sheets/subtypes/actor/ambersteel-base-actor-sheet.mjs";

const WIDTH = 550;
const MAX_COLUMNS = 4;
const TILE_SIZE = Math.floor(WIDTH / MAX_COLUMNS);

const PATH_TEXTURE_SLOT = "systems/ambersteel/images/box.png";
const PATH_BULK = "systems/ambersteel/images/weight-hanging-solid.svg";
const PATH_QUANTITY = "systems/ambersteel/images/hashtag-solid.svg";
const PATH_SEND_TO_CHAT = "systems/ambersteel/images/dice-three-solid.svg";
const PATH_DELETE = "systems/ambersteel/images/trash-solid.svg";
const PATH_OPEN_SHEET = "systems/ambersteel/images/external-link-alt-solid.svg";

const LOADER = new PIXI.Loader();
const TEXTURES = {};

LOADER.add("itemSlot", PATH_TEXTURE_SLOT);
LOADER.add("itemBulk", PATH_BULK);
LOADER.add("itemQuantity", PATH_QUANTITY);
LOADER.add("itemSendToChat", PATH_SEND_TO_CHAT);
LOADER.add("itemDelete", PATH_DELETE);
LOADER.add("itemOpenSheet", PATH_OPEN_SHEET);

LOADER.load((loader, resources) => {
  TEXTURES.ITEM_SLOT = resources.itemSlot.texture,
  TEXTURES.BULK = resources.itemBulk.texture,
  TEXTURES.QUANTITY = resources.itemQuantity.texture,
  TEXTURES.SEND_TO_CHAT = resources.itemSendToChat.texture,
  TEXTURES.DELETE = resources.itemDelete.texture,
  TEXTURES.OPEN_SHEET = resources.itemOpenSheet.texture
});

const FONT_FAMILY = "Black-Chancery";

const TEXT_SETTINGS = {fontFamily : FONT_FAMILY, fontSize: 18, fontWeight: "bolder", fill : 0x191813, align : 'center'};
const TEXT_SETTINGS_INVERSE = {fontFamily : FONT_FAMILY, fontSize: 18, fontWeight: "bolder", fill : 0xffffff, align : 'center'};

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
      const itemOnGrid = new ItemOnGrid(this._pixiApp, item);
      this._itemsOnGrid.push(itemOnGrid);

      this._rootContainer.addChild(itemOnGrid.rootContainer);
      itemOnGrid.x = index.x * TILE_SIZE;
      itemOnGrid.y = index.y * TILE_SIZE;
    }
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

// TODO: Implement proper layouting-logic or figure out how to make yoga layout for PixiJS work. 
class ItemOnGrid {
  /**
   * @type {PIXI.Application}
   * @private
   */
  _pixiApp = undefined;

  /**
   * @type {AmbersteelItemItem}
   * @private
   */
  _item = undefined;
  
  /**
   * @type {Object}
   * @private
   */
  _shape = { width: 1, height: 1 };

  /**
   * Bounding rectangle. 
   * @type {PIXI.Rectangle}
   * @private
   */
  _rootRect = new PIXI.Rectangle();

  /**
   * Bounding rectangle of the padded content. 
   * Relative to {self._rootRect}. 
   * @type {PIXI.Rectangle}
   * @private
   */
  _contentRect = new PIXI.Rectangle();
  
  /**
   * Actual content container. 
   * Has padding. 
   * @type {PIXI.Container}
   * @private
   */
  _contentContainer = new PIXI.Container();
  
  /**
   * Root Container which encompasses the entire item on grid. 
   * @type {PIXI.Container}
   */
  rootContainer = new PIXI.Container();

  get x() { return this._rootRect.x; }
  set x(value) {
    this._rootRect.x = value;
    this.rootContainer.x = value;
  }

  get y() { return this._rootRect.y; }
  set y(value) {
    this._rootRect.y = value;
    this.rootContainer.y = value;
  }

  get width() { return this._rootRect.width; }
  set width(value) {
    this._rootRect.width = value;
    this.rootContainer.width = value;
  }

  get height() { return this._rootRect.height; }
  set height(value) {
    this._rootRect.height = value;
    this.rootContainer.height = value;
  }

  constructor(pixiApp, item) {
    this._pixiApp = pixiApp;
    this._item = item;
    this._shape = item.data.data.shape;

    this._rootRect = new PIXI.Rectangle(
      0, 
      0, 
      this._shape.width * TILE_SIZE, 
      this._shape.height * TILE_SIZE
    );
    this._contentRect = new PIXI.Rectangle(
      PADDING.x, 
      PADDING.y, 
      this._rootRect.width - (PADDING.x * 2), 
      this._rootRect.height - (PADDING.y * 2)
    );

    // Background sprite.
    this._spriteBackground = new PIXI.Sprite.from(TEXTURES.ITEM_SLOT);
    this.rootContainer.addChild(this._spriteBackground);
    this._spriteBackground.width = this._rootRect.width;
    this._spriteBackground.height = this._rootRect.height;
    
    // Content container. 
    this.rootContainer.addChild(this._contentContainer);

    this._contentContainer.x = this._contentRect.x;
    this._contentContainer.y = this._contentRect.y;

    // Icon sprite. 
    this._spriteIcon = new PIXI.Sprite.from(TEXTURES.BULK);
    this._contentContainer.addChild(this._spriteIcon);
    this._spriteIcon.alpha = 0.5;

    // Name.
    this._textName = new PIXI.Text(item.name, TEXT_SETTINGS);
    this._contentContainer.addChild(this._textName);
    this._textName.x = (this._contentRect.width / 2) - (this._textName.width / 2);
    this._textName.y = this._contentRect.height - this._textName.height;
    
    // Quantity.
    this._containerQuantity = new PIXI.Container();
    this._contentContainer.addChild(this._containerQuantity);
    
    this._spriteQuantity = new PIXI.Sprite.from(TEXTURES.QUANTITY);
    this._containerQuantity.addChild(this._spriteQuantity);
    this._spriteQuantity.width = 14;
    this._spriteQuantity.height = 16;
    
    this._textQuantity = new PIXI.Text(item.data.data.quantity, TEXT_SETTINGS);
    this._containerQuantity.addChild(this._textQuantity);
    this._textQuantity.x = this._spriteQuantity.x + this._spriteQuantity.width + 3;

    this._containerQuantity.y = this._textName.y - this._containerQuantity.height;

    // Bulk.
    this._containerBulk = new PIXI.Container();
    this._contentContainer.addChild(this._containerBulk);
    const sizeBulk = 24;
    const rectBulk = new PIXI.Rectangle(this._contentRect.width - sizeBulk, this._contentRect.height - sizeBulk, sizeBulk, sizeBulk);

    this._spriteBulk = new PIXI.Sprite.from(TEXTURES.BULK);
    this._containerBulk.addChild(this._spriteBulk);
    this._spriteBulk.width = sizeBulk;
    this._spriteBulk.height = sizeBulk;
    
    this._textBulk = new PIXI.Text(item.data.data.bulk, TEXT_SETTINGS_INVERSE);
    this._containerBulk.addChild(this._textBulk);
    centerOn(this._textBulk, rectBulk, true);
    this._textBulk.y = this._textBulk.y + 3;
    
    this._containerBulk.x = this._contentRect.width - sizeBulk;
    this._containerBulk.y = this._textName.y - rectBulk.height;
    
    // Delete/Remove button.
    this._containerDelete = new PIXI.Container();
    this._contentContainer.addChild(this._containerDelete);
    
    this._spriteDelete = new PIXI.Sprite.from(TEXTURES.DELETE);
    this._spriteDelete.width = 14;
    this._spriteDelete.height = 16;
    this._containerDelete.addChild(this._spriteDelete);

    this._containerDelete.x = this._contentRect.width - this._spriteDelete.width;

    // SendToChat button. 

    // OpenSheet button. 

    // Icon Sprite size.
    const spriteIconSize = getProportionalMaxSize(
      this._spriteIcon.width, 
      this._spriteIcon.height, 
      this._contentRect.width, 
      this._contentRect.height - this._textName.height, 
    );
    this._spriteIcon.width = spriteIconSize.w;
    this._spriteIcon.height = spriteIconSize.h;
    centerOn(this._spriteIcon, this._contentRect, true);
  }

  /**
   * Toggles between the vertical and horizontal orientation. 
   */
  rotate() {
    console.warn("Not implemented");
  }
}
