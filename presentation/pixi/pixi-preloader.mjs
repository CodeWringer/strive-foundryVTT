import VersionCode from "../../business/migration/version-code.mjs";

const BASE_PATH = "systems/ambersteel/presentation/image";

/**
 * Constants of all the image texture urls for use with PixiJS.
 * 
 * @constant
 * 
 * @property {String} ACTION_POINT_EMPTY 
 * @property {String} ACTION_POINT_FULL 
 * @property {String} CARET_LEFT 
 * @property {String} CARET_RIGHT 
 */
export const TEXTURES = {
  ACTION_POINT_EMPTY: `${BASE_PATH}/action-point-empty.png`,
  ACTION_POINT_FULL: `${BASE_PATH}/action-point-full.png`,
  CARET_LEFT: `${BASE_PATH}/caret-left-solid.png`,
  CARET_RIGHT: `${BASE_PATH}/caret-right-solid.png`,
};

/**
 * A map of `TEXTURES` mapped to a texture instance that was 
 * preloaded. 
 * @type {Map<String, PIXI.Texture>}
 */
const preloadedTextures = new Map();

/**
 * @type {VersionCode}
 * @constant
 * @readonly
 */
const PIXI_VERSION = VersionCode.fromString(PIXI.VERSION);

/**
 * @type {VersionCode}
 * @constant
 * @readonly
 */
const FOUNDRY_10_PIXI_VERSION = new VersionCode(6, 5, 2);

/**
 * Preloads all custom PIXI textures and caches them for synchronous access later. 
 * 
 * @async
 */
export async function preloadPixiTextures() {
  if (PIXI_VERSION.greaterThan(FOUNDRY_10_PIXI_VERSION)) {
    for (const propertyName in TEXTURES) {
      const url = TEXTURES[propertyName];
      const texture = await PIXI.Assets.load(url);
      preloadedTextures.set(url, texture);
    }
  } else {
    await PIXI.Loader.shared
      .add(TEXTURES.ACTION_POINT_EMPTY)
      .add(TEXTURES.ACTION_POINT_FULL)
      .add(TEXTURES.CARET_LEFT)
      .add(TEXTURES.CARET_RIGHT)
      .load();
  }
}

/**
 * Fetches and returns the PIXI texture identified by the given key. 
 * 
 * Abstracts away the exact access mechanism, so that changes in PIXI's API 
 * only impact **this** piece of code. 
 * 
 * @param {String} key One of the `TEXTURES` constants that identify 
 * one of the textures. 
 * 
 * @returns {Object}
 */
export function getPixiTexture(key) {
  if (PIXI_VERSION.greaterThan(FOUNDRY_10_PIXI_VERSION)) {
    return preloadedTextures.get(key);
  } else {
    return PIXI.Loader.shared.resources[key].texture;
  }
}
