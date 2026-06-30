import PixiButton from "./pixi-button.mjs";
import { PIXI_GLOBALS } from "./pixi-globals.mjs";
import { PixiLoader } from "./pixi-preloader.mjs";

/**
 * Wraps the `presentation.canvas.pixi`, which contains all pixi related classes. 
 */
export const pixi = {
  PixiButton: PixiButton,
  PIXI_GLOBALS: PIXI_GLOBALS,
  PixiLoader: PixiLoader,
  init: () => {
    PixiLoader.preloadTextures();
    PixiLoader.preloadGraphics();
  },
};
