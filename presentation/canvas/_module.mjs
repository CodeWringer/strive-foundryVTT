import { pixi } from "./pixi/_module.mjs";
import { token } from "./token/_module.mjs";

/**
 * Wraps the `presentation.canvas` module. 
 */
export const canvas = {
  pixi: pixi,
  token: token,
  init: () => {
    pixi.init();
    token.init();
  },
};
