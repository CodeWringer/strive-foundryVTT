import { combat } from "./combat/_module.mjs";

/**
 * Wraps the `presentation.sidebar` module. 
 */
export const sidebar = {
  combat: combat,
  init: () => {
    combat.init();
  },
};
