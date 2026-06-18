import { combat } from "./combat/_module.mjs";

export {
  combat,
};

/**
 * Wraps the `presentation.sidebar` module. 
 */
export const sidebar = {
  combat: combat,
  init: () => {
    combat.init();
  },
};
