import { AmbersteelActor } from "../documents/actor.mjs";
import { ActorEvents } from "../documents/actor.mjs";
import AmbersteelItemItem from "../documents/subtypes/item/ambersteel-item-item.mjs";
import InventoryIndex from "../dto/inventory-index.mjs";
import CenterLayoutContainer from "../pixi/center-layout-container.mjs";
import Containable from "../pixi/containable.mjs";
import DisplayObjectWrap from "../pixi/display-object-wrap.mjs";
import HorizontalLayoutContainer from "../pixi/horizontal-layout-container.mjs";
import VerticalLayoutContainer from "../pixi/vertical-layout-container.mjs";
import AmbersteelBaseActorSheet from "../sheets/subtypes/actor/ambersteel-base-actor-sheet.mjs";

const WIDTH = 550;
const MAX_COLUMNS = 4;
const TILE_SIZE = Math.floor(WIDTH / MAX_COLUMNS);

const PATH_TEXTURE_SLOT = "systems/ambersteel/images/box.png";
const PATH_BULK = "systems/ambersteel/images/weight-hanging-solid.svg";
const PATH_QUANTITY = "systems/ambersteel/images/hashtag-solid.svg";
const PATH_SEND_TO_CHAT = "systems/ambersteel/images/comments-solid.svg";
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
  _rootContainer = new PIXI.Container();
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
  
    this._stage.addChild(this._rootContainer);
  
    this._setupTiles();
  
    const indices = this._actor.data.data.assets.inventory; // A list of {InventoryIndex}
    const items = this._actor.possessions; // A list of {AmbersteelItemItem}
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
    this._stage.buttonMode = true;
    this._stage.on("pointerdown", () => {
      console.log("clicked!");
      for (const itemOnGrid of this._itemsOnGrid) {
        itemOnGrid.showDebug = !itemOnGrid.showDebug;
      }
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
   * @type {CenterLayoutContainer}
   * @private
   */
  _contentContainer = undefined;

  /**
   * Root Container which encompasses the entire item on grid. 
   * @type {CenterLayoutContainer}
   */
  rootContainer = undefined;

  get x() { return this.rootContainer.x; }
  set x(value) { this.rootContainer.x = value; }

  get y() { return this.rootContainer.y; }
  set y(value) { this.rootContainer.y = value; }

  get width() { return this.rootContainer.width; }
  set width(value) { this.rootContainer.width = value; }

  get height() { return this.rootContainer.height; }
  set height(value) { this.rootContainer.height = value; }

  _showDebug = false;
  get showDebug() { return this._showDebug; }
  set showDebug(value) {
    this._showDebug = value;
    this.rootContainer.drawDebug = value;
  }

  constructor(item, tileSize, pixiApp) {
    this._item = item;
    this._shape = item.data.data.shape;

    this.rootContainer = new CenterLayoutContainer(pixiApp);
    this._contentContainer = new VerticalLayoutContainer(pixiApp);
    
    this.width = this._shape.width * tileSize.width;
    this.height = this._shape.height * tileSize.height;

    this.rootContainer.padding.x = 8;
    this.rootContainer.padding.y = 8;

    // Background sprite.
    this._spriteBackground = new PIXI.Sprite.from(TEXTURES.ITEM_SLOT);
    this._spriteBackground.width = this.rootContainer.width;
    this._spriteBackground.height = this.rootContainer.height;
    this.rootContainer.wrapped.addChild(this._spriteBackground);

    this._contentContainer.fill = true;
    this.rootContainer.addChild(this._contentContainer);

    // HEADER

    const HEADER_HEIGHT = 16;

    this._containerHeader = new HorizontalLayoutContainer(pixiApp);
    this._containerHeader.height = HEADER_HEIGHT;
    this._contentContainer.addChild(this._containerHeader);

    // SendToChat button. 
    this._containerSendToChat = new CenterLayoutContainer(pixiApp);
    this._containerSendToChat.width = HEADER_HEIGHT;
    
    this._spriteSendToChat = new DisplayObjectWrap(new PIXI.Sprite.from(TEXTURES.SEND_TO_CHAT), pixiApp);
    this._containerSendToChat.addChild(this._spriteSendToChat);

    this._containerHeader.addChild(this._containerSendToChat);
    
    // Spacer between SendToChat and OpenSheet. 
    const headerButtonsSpacer1 = new Containable(pixiApp);
    headerButtonsSpacer1.width = 6;
    this._containerHeader.addChild(headerButtonsSpacer1);

    // OpenSheet button. 
    this._containerOpenSheet = new CenterLayoutContainer(pixiApp);
    this._containerOpenSheet.width = HEADER_HEIGHT;
    
    this._spriteOpenSheet = new DisplayObjectWrap(new PIXI.Sprite.from(TEXTURES.OPEN_SHEET), pixiApp);
    this._containerOpenSheet.addChild(this._spriteOpenSheet);

    this._containerHeader.addChild(this._containerOpenSheet);
    
    // Header spacer. 
    const headerSpacer2 = new Containable(pixiApp);
    headerSpacer2.fill = true;
    this._containerHeader.addChild(headerSpacer2);

    // Delete/Remove button.
    this._containerDelete = new CenterLayoutContainer(pixiApp);
    this._containerDelete.width = 14;
    
    this._spriteDelete = new DisplayObjectWrap(new PIXI.Sprite.from(TEXTURES.DELETE), pixiApp);
    this._containerDelete.addChild(this._spriteDelete);

    this._containerHeader.addChild(this._containerDelete);

    // ICON
    this._containerIcon = new CenterLayoutContainer(pixiApp);
    this._containerIcon.fill = true;

    this._spriteIcon = new DisplayObjectWrap(new PIXI.Sprite.from(TEXTURES.BULK), pixiApp);
    this._spriteIcon.alpha = 0.5;
    this._containerIcon.addChild(this._spriteIcon);

    this._contentContainer.addChild(this._containerIcon);

    // META
    const META_HEIGHT = 18;

    this._containerMeta = new HorizontalLayoutContainer(pixiApp);
    this._containerMeta.height = META_HEIGHT;
    this._contentContainer.addChild(this._containerMeta);

    // Quantity.
    this._containerQuantity = new HorizontalLayoutContainer(pixiApp);
    this._containerQuantity.height = META_HEIGHT;
    this._containerQuantity.width = META_HEIGHT + 6 + META_HEIGHT;
    this._containerMeta.addChild(this._containerQuantity);
    
    const containerQuantityImage = new CenterLayoutContainer(pixiApp);
    containerQuantityImage.width = META_HEIGHT;
    this._containerQuantity.addChild(containerQuantityImage);

    this._spriteQuantity = new DisplayObjectWrap(new PIXI.Sprite.from(TEXTURES.QUANTITY), pixiApp);
    containerQuantityImage.addChild(this._spriteQuantity);

    const quantitySpacer = new Containable(pixiApp);
    quantitySpacer.width = 6;
    this._containerQuantity.addChild(quantitySpacer);
    
    this._textQuantity = new DisplayObjectWrap(new PIXI.Text(item.data.data.quantity, TEXT_SETTINGS), pixiApp);
    this._containerQuantity.addChild(this._textQuantity);

    // Spacer.
    const metaSpacer = new Containable(pixiApp);
    metaSpacer.fill = true;
    this._containerMeta.addChild(metaSpacer);

    // Bulk.
    this._containerBulk = new CenterLayoutContainer(pixiApp);
    this._containerBulk.width = META_HEIGHT;
    this._containerMeta.addChild(this._containerBulk);

    this._spriteBulk = new DisplayObjectWrap(new PIXI.Sprite.from(TEXTURES.BULK), pixiApp);
    this._containerBulk.addChild(this._spriteBulk);
    
    this._textBulk = new DisplayObjectWrap(new PIXI.Text(item.data.data.bulk, TEXT_SETTINGS_INVERSE), pixiApp);
    this._containerBulk.addChild(this._textBulk);

    // FOOTER
    const FOOTER_HEIGHT = 20;

    this._contentFooter = new CenterLayoutContainer(pixiApp);
    this._contentFooter.height = FOOTER_HEIGHT;
    this._contentContainer.addChild(this._contentFooter);

    // Title
    this._textName = new DisplayObjectWrap(new PIXI.Text(item.name, TEXT_SETTINGS), pixiApp);
    this._contentFooter.addChild(this._textName);
  }

  /**
   * Toggles between the vertical and horizontal orientation. 
   */
  rotate() {
    console.warn("Not implemented");
  }
}
