import { dice } from "./dice/_module.mjs";
import { migration } from "./migration/_module.mjs";
import { model } from "./model/_module.mjs"
import { combat } from "./model/combat/_module.mjs";
import { setting } from "./setting/_module.mjs";

export {
  model,
  dice,
  migration,
  combat,
  setting,
};

/**
 * Wraps the `business` module, which contains all the 
 * 
 * Note the `init` function MUST be called during system setup!
 */
export const business = {
  model: model,
  dice: dice,
  migration: migration,
  combat: combat,
  setting: setting,
  /**
   * Initialization, which MUST be called during system setup!
   * 
   * Ensures data model and document classes are registered. 
   */
  init: () => {
    model.init();
    combat.init();
    setting.init();
  },
  /**
   * Initialization to be called during the system's "ready" hook. 
   */
  ready: () => {
    setting.ready();
  },
};
