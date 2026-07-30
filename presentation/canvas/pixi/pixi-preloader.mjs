import { PIXI_GLOBALS } from "./pixi-globals.mjs";

const BASE_PATH = "systems/strive/presentation/image";

/**
 * Wraps PixiJs functionality for ease of use. 
 * 
 * Abstracts away exact access mechanisms, so that changes in PIXI's API 
 * only impact **this** piece of code. 
 * 
 * @constant
 */
export const PixiLoader = {
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
  TEXTURES: {
    ACTION_POINT_EMPTY: `${BASE_PATH}/action-point-empty.png`,
    ACTION_POINT_FULL: `${BASE_PATH}/action-point-full.png`,
    CARET_LEFT: `${BASE_PATH}/triangle-left-24-dark.png`,
    CARET_RIGHT: `${BASE_PATH}/triangle-right-24-dark.png`,
  },

  /**
   * Constants of all the vector graphics urls for use with PixiJS.
   * 
   * @constant
   * 
   * @property {String} ACTION_POINT_EMPTY 
   * @property {String} ACTION_POINT_FULL 
   * @property {String} CARET_LEFT 
   * @property {String} CARET_RIGHT 
   */
  VECTOR_GRAPHICS: {
    // CARET_LEFT: `${BASE_PATH}/triangle-left-24-dark.svg`,
    // CARET_RIGHT: `${BASE_PATH}/triangle-right-24-dark.svg`,
  },

  /**
   * A map of `TEXTURES` mapped to a texture instance that was 
   * preloaded. 
   * @type {Map<String, PIXI.Texture>}
   */
  _preloadedTextures: new Map(),


  /**
   * A map of `VECTOR_GRAPHICS` mapped to a graphics instance that was 
   * preloaded. 
   * @type {Map<String, Graphics>}
   */
  _preloadedGraphics: new Map(),

  /**
   * Preloads all custom PIXI textures and caches them for synchronous access later. 
   * 
   * @async
   */
  preloadTextures: async function () {
    if (PIXI_GLOBALS.PIXI_VERSION.greater(PIXI_GLOBALS.FOUNDRY_10_PIXI_VERSION)) {
      for (const propertyName in this.TEXTURES) {
        const url = this.TEXTURES[propertyName];
        const texture = await PIXI.Assets.load(url);
        this._preloadedTextures.set(url, texture);
      }
    } else {
      await PIXI.Loader.shared
        .add(this.TEXTURES.ACTION_POINT_EMPTY)
        .add(this.TEXTURES.ACTION_POINT_FULL)
        .add(this.TEXTURES.CARET_LEFT)
        .add(this.TEXTURES.CARET_RIGHT)
        .load();
    }
  },

  /**
   * Preloads all custom PIXI graphics and caches them for synchronous access later. 
   * 
   * @async
   */
  preloadGraphics: async function () {
    for (const propertyName in this.VECTOR_GRAPHICS) {
      const url = this.VECTOR_GRAPHICS[propertyName];
      let svg;
      if (PIXI_GLOBALS.PIXI_VERSION.greater(PIXI_GLOBALS.FOUNDRY_11_PIXI_VERSION)) {
        svg = await PIXI.Assets.load(url, {
          parseAsGraphicsContext: true, // If false, it returns a texture instead.
        });
      } else {
        svg = await PIXI.Assets.load(url);
      }
      const graphics = new PIXI.Graphics(svg);
      this._preloadedGraphics.set(url, graphics);
    }
  },

  /**
   * Fetches and returns the PIXI texture identified by the given key. 
   * 
   * @param {String} key One of the `TEXTURES` constants. 
   * 
   * @returns {PIXI.Texture}
   */
  getTexture: function (key) {
    if (PIXI_GLOBALS.PIXI_VERSION.greater(PIXI_GLOBALS.FOUNDRY_10_PIXI_VERSION)) {
      return this._preloadedTextures.get(key);
    } else {
      return PIXI.Loader.shared.resources[key].texture;
    }
  },

  /**
   * Fetches and returns the PIXI graphics instance identified by the given key. 
   * 
   * @param {String} key One of the `VECTOR_GRAPHICS` constants. 
   * 
   * @returns {PIXI.Graphics}
   */
  getGraphics: function (key) {
    return this._preloadedGraphics.get(key);
  },

  /**
   * Loads and returns a texture identified by the given url. 
   * 
   * @param {String} url (Relative) url to an image file. 
   * 
   * @returns {PIXI.Texture}
   * @async
   */
  load: async function(url) {
    return await PIXI.Assets.load(url);
  },
};
