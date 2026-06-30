import { migration } from "./migration/_module.mjs";
import { model } from "./model/_module.mjs"
import { search } from "./search/_module.mjs";
import { setting } from "./setting/_module.mjs";

/**
 * Wraps the `business` module, which contains all the 
 * 
 * Note the `init` function MUST be called during system setup!
 */
export const business = {
  model: model,
  migration: migration,
  setting: setting,
  search: search,
  /**
   * Initialization, which MUST be called during system setup!
   * 
   * Ensures data model and document classes are registered. 
   */
  init: () => {
    model.init();
    setting.init();
    migration.init();
  },
  /**
   * Initialization to be called during the system's "setup" hook. 
   */
  setup: () => {
    // Nothing, yet.
  },
  /**
   * Initialization to be called during the system's "ready" hook. 
   */
  ready: () => {
    setting.ready();
  },
};
