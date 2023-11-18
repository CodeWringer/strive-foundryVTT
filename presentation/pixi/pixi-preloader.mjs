const BASE_PATH = "systems/ambersteel/presentation/image";

/**
 * Constants of all the image textures for use with PixiJS.
 * 
 * @constant
 */
export const TEXTURES = {
  ACTION_POINT_EMPTY: `${BASE_PATH}/action-point-empty.png`,
  ACTION_POINT_FULL: `${BASE_PATH}/action-point-full.png`,
  CARET_LEFT: `${BASE_PATH}/caret-left-solid.png`,
  CARET_RIGHT: `${BASE_PATH}/caret-right-solid.png`,
};

export async function preloadPixiTextures() {
  await PIXI.Loader.shared
    .add(TEXTURES.ACTION_POINT_EMPTY)
    .add(TEXTURES.ACTION_POINT_FULL)
    .add(TEXTURES.CARET_LEFT)
    .add(TEXTURES.CARET_RIGHT)
    .load();
}
