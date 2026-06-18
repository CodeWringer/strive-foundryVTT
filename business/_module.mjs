import { dice } from "./dice/_module.mjs";
import { model } from "./model/_module.mjs"

export {
  model,
};

/**
 * Wraps the `business` module.
 * 
 * Note the `init` function MUST be called during system setup!
 */
export const business = {
  model: model,
  dice: dice,
  /**
   * Initialization, which MUST be called during system setup!
   * 
   * Ensures data model and document classes are registered. 
   */
  init: () => {
    // Ensure data model classes are registered.
    model.dataModel.init();
    // Ensure document classes are registered. 
    model.document.init();
  },
};
