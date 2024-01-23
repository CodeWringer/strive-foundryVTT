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
 * Preloads all custom PIXI textures and caches them for synchronous access later. 
 * 
 * @async
 */
export async function preloadPixiTextures() {
  for (const propertyName in TEXTURES) {
    const url = TEXTURES[propertyName];
    const texture = await PIXI.Assets.load(url);
    preloadedTextures.set(url, texture);
  }
}

/**
 * Fetches and returns the PIXI texture identified by the given key. 
 * 
 * @param {String} key One of the `TEXTURES` constants that identify 
 * one of the textures. 
 * 
 * @returns {Object}
 */
export function getPixiTexture(key) {
  return preloadedTextures.get(key);
}
