import { application } from "./application/_module.mjs";

export {
  application,
};

/**
 * Wraps the `presentation` module. 
 * 
 * IMPORTANT the `init` function MUST be called during the system's setup!
 */
export const presentation = {
  application: application,
  /**
   * Initialization, which MUST be called during system setup!
   * 
   * Ensures sheets are registered.
   */
  init: () => {
    application.init();
  },
};
