import ButtonViewModel from "./button/button-viewmodel.mjs";
import InputDropDownViewModel from "./input-choice/input-dropdown/input-dropdown-viewmodel.mjs";
import InputNumberSpinnerViewModel from "./input-number-spinner/input-number-spinner-viewmodel.mjs";
import InputRichTextViewModel from "./input-rich-text/input-rich-text-viewmodel.mjs";
import InputTextFieldViewModel from "./input-textfield/input-textfield-viewmodel.mjs";

/**
 * Wraps the `presentation.application.component` module. 
 */
export const component = {
  ButtonViewModel: ButtonViewModel,
  InputTextFieldViewModel: InputTextFieldViewModel,
  InputNumberSpinnerViewModel: InputNumberSpinnerViewModel,
  InputDropDownViewModel: InputDropDownViewModel,
  InputRichTextViewModel: InputRichTextViewModel,
  /**
   * Initialization, which MUST be called during system setup!
   */
  init: async () => {
    ButtonViewModel.registerHandlebarsPartial();
    InputTextFieldViewModel.registerHandlebarsPartial();
    InputNumberSpinnerViewModel.registerHandlebarsPartial();
    InputDropDownViewModel.registerHandlebarsPartial();
    InputRichTextViewModel.registerHandlebarsPartial();
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
