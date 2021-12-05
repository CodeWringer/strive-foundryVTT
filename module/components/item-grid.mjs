let pixiApp = {};
let stage = {};

const WIDTH = 550;
const MAX_COLUMNS = 6;
const TILE_SIZE = Math.floor(WIDTH / MAX_COLUMNS);

export function setupGrid(html, canvasElementId, actor) {
  const tileCount = actor.maxBulk;
  const canvasElement = html.find("#" + canvasElementId)[0];

  const height = Math.ceil(tileCount / MAX_COLUMNS) * TILE_SIZE;
  canvasElement.style.height = height;

  pixiApp = new PIXI.Application({
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
    backgroundColor: 0x6495ed,
    width: WIDTH,
    height: height
  });
  canvasElement.appendChild(pixiApp.view);
  stage = pixiApp.stage;

  const testSprite = PIXI.Sprite.from("systems/ambersteel/images/box.png");
  
  testSprite.anchor.set(0.5);
  testSprite.w = TILE_SIZE;
  testSprite.h = TILE_SIZE;
  testSprite.x = pixiApp.screen.width / 2;
  testSprite.y = pixiApp.screen.height / 2;
  stage.addChild(testSprite);

  let elapsed = 0.0;
  pixiApp.ticker.add((delta) => {
    elapsed += delta;
    testSprite.x = 100.0 + Math.cos(elapsed/50.0) * 100.0;
  });
}