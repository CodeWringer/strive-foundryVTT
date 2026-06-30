import InputNumberSpinnerViewModel from "./input-number-spinner/input-number-spinner-viewmodel.mjs";

/**
 * Wraps the `presentation` module. 
 * 
 * IMPORTANT the `init` function MUST be called during the system's setup!
 */
export const component = {
  InputNumberSpinnerViewModel: InputNumberSpinnerViewModel,
  /**
   * Initialization, which MUST be called during system setup!
   * 
   * Ensures sheets are registered and preloads Handlebars templates.
   * 
   */
  init: async () => {

  },
  /**
   * Initialization to be called during the system's "setup" hook. 
   */
  setup: () => {
  },
  /**
   * Initialization to be called during the system's "ready" hook. 
   */
  ready: () => {
  },
};
