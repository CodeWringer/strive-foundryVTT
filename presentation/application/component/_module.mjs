import ButtonViewModel from "./button/button-viewmodel.mjs";
import DynamicComponent from "./dynamic-component/dynamic-component.mjs";
import InputDropDownViewModel from "./input-choice/input-dropdown/input-dropdown-viewmodel.mjs";
import InputNumberSpinnerViewModel from "./input-number-spinner/input-number-spinner-viewmodel.mjs";
import InputRichTextViewModel from "./input-rich-text/input-rich-text-viewmodel.mjs";
import InputTextFieldViewModel from "./input-textfield/input-textfield-viewmodel.mjs";
import PreparedSection from "./dynamic-component/prepared-section.mjs";
import RowViewModel from "./row/row-viewmodel.mjs";
import CustomProseMirrorMenu from "./input-rich-text/custom-prose-mirror-menu.mjs";
import InputReferenceViewModel from "./input-reference/input-reference-viewmodel.mjs";
import InputSplitNumberSpinnerViewModel from "./input-split-number-spinner/input-split-number-spinner-viewmodel.mjs";

/**
 * Wraps the `presentation.application.component` module. 
 */
export const component = {
  PreparedSection: PreparedSection,
  ButtonViewModel: ButtonViewModel,
  InputTextFieldViewModel: InputTextFieldViewModel,
  InputNumberSpinnerViewModel: InputNumberSpinnerViewModel,
  InputDropDownViewModel: InputDropDownViewModel,
  InputRichTextViewModel: InputRichTextViewModel,
  DynamicComponent: DynamicComponent,
  RowViewModel: RowViewModel,
  CustomProseMirrorMenu: CustomProseMirrorMenu,
  InputSplitNumberSpinnerViewModel: InputSplitNumberSpinnerViewModel,
  InputReferenceViewModel: InputReferenceViewModel,
  /**
   * Initialization, which MUST be called during system setup!
   */
  init: async () => {
    ButtonViewModel.registerHandlebarsPartial();
    InputTextFieldViewModel.registerHandlebarsPartial();
    InputNumberSpinnerViewModel.registerHandlebarsPartial();
    InputDropDownViewModel.registerHandlebarsPartial();
    InputRichTextViewModel.registerHandlebarsPartial();
    InputSplitNumberSpinnerViewModel.registerHandlebarsPartial();
    InputReferenceViewModel.registerHandlebarsPartial();
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
