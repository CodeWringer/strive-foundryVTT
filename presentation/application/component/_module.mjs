import InputDropDownViewModel from "./input-choice/input-dropdown/input-dropdown-viewmodel.mjs";
import InputNumberSpinnerViewModel from "./input-number-spinner/input-number-spinner-viewmodel.mjs";
import InputTextFieldViewModel from "./input-textfield/input-textfield-viewmodel.mjs";

/**
 * Wraps the `presentation.application.component` module. 
 */
export const component = {
  InputTextFieldViewModel: InputTextFieldViewModel,
  InputNumberSpinnerViewModel: InputNumberSpinnerViewModel,
  InputDropDownViewModel: InputDropDownViewModel,
  /**
   * Initialization, which MUST be called during system setup!
   */
  init: async () => {
    InputTextFieldViewModel.registerHandlebarsPartial();
    InputNumberSpinnerViewModel.registerHandlebarsPartial();
    InputDropDownViewModel.registerHandlebarsPartial();
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
