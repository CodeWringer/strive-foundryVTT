import { ActorEvents } from "../documents/actor.mjs";

/* TODO: Test and check if this is a global singleton, which would cause problems 
*  if multiple actor sheets were open at the same time. 
*  Test case: 
* - Open two actor sheets, remember which one was added last. 
* - Switch to assets tab on both. 
* - Add possession to first actor sheet that was openend. 
* - If the possession is added to the last opened sheet, there is a singleton problem. 
*/

const _eventListeners = Object.create(null);

let _pixiApp = undefined;
let _stage = undefined;
const _sprites = [];

const WIDTH = 550;
const MAX_COLUMNS = 6;
const TILE_SIZE = Math.floor(WIDTH / MAX_COLUMNS);

const textureItemSlot = PIXI.Texture.from("systems/ambersteel/images/box.png");

export function setupPossessionGrid(html, canvasElementId, actor) {
  _registerEvents(actor);

  const tileCount = actor.maxBulk;
  
  // Setup HTML canvas element. 
  const canvasElement = html.find("#" + canvasElementId)[0];
  const height = Math.ceil(tileCount / MAX_COLUMNS) * TILE_SIZE;
  canvasElement.style.height = height;

  // Setup Pixi app. 
  _pixiApp = new PIXI.Application({
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
    backgroundColor: 0x6495ed,
    width: WIDTH,
    height: height
  });
  canvasElement.appendChild(_pixiApp.view);
  _stage = _pixiApp.stage;

  _setupTiles(_stage, tileCount);

  _setupItemsOnGrid(_stage, actor);
  
  _setupInteractivity(_pixiApp, _stage, actor);
}

function _registerEvents(actor) {
  _eventListeners.possessionAdded = actor.on(ActorEvents.possessionAdded, (item) => {
    // TODO: Add to grid. 
  });
  _eventListeners.possessionRemoved = actor.on(ActorEvents.possessionRemoved, (item) => {
    // TODO: Remove from grid. 
  });
  _eventListeners.possessionUpdated = actor.on(ActorEvents.possessionUpdated, (item) => {
    /* TODO: Update item on grid.
    * If *any* of visble the properties of the item changed, 
    * that change has to be applied to the object on canvas, as well. 
    */
  });
}

function _setupTiles(stage, tileCount) {
  let x = 0;
  let y = 0;

  for (let i = 0; i < tileCount; i++) {
    const spriteItemSlot = PIXI.Sprite(textureItemSlot);
    spriteItemSlot.w = TILE_SIZE;
    spriteItemSlot.h = TILE_SIZE;
    spriteItemSlot.x = x * TILE_SIZE;
    spriteItemSlot.y = y * TILE_SIZE;
    _sprites.push(spriteItemSlot);
    stage.addChild(spriteItemSlot);

    x++;
    if ((x + 1) == MAX_COLUMNS) {
      x = 0;
      y++;
    }
  }
}

function _setupItemsOnGrid(_stage, actor) {
  // TODO: Place every possession on the grid. 
  // Must work with actor.data.data.assets.inventory, which is a list of {InventoryIndex}
}

function _setupInteractivity(app, stage, actor) {
  app.ticker.add((delta) => {
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

export function tearDownPossessionGrid(actor) {
  _unregisterEvents(actor);

  // TODO: Tear down pixiApp
}

function _unregisterEvents(actor) {
  for (const eventListener in _eventListeners) {
    actor.off(eventListener);
  }
}