import FoundryWrapper from "../../foundry-interop/foundry-wrapper.mjs";
import { component } from "./component/_module.mjs";
import Tooltip from "./component/tooltip/tooltip.mjs";
import BaseItemSheetViewModel from "./item/base/sheet/base-item-sheet-viewmodel.mjs";
import { BaseItemSheet } from "./item/base/sheet/base-item-sheet.mjs";
import { LanguageItemSheet } from "./item/language/language-item-sheet.mjs";
import { TEMPLATES } from "./templates.mjs";
import BaseSheetViewModel from "./view-model/base-sheet-viewmodel.mjs";
import InputViewModel from "./view-model/input-view-model.mjs";
import ViewModelCollection from "./view-model/view-model-collection.mjs";
import ViewModel from "./view-model/view-model.mjs";
import { dialog } from "./dialog/_module.mjs";

/**
 * Wraps the `presentation.application` module, which contains all dedicated windows, 
 * dialogs and sheets. 
 */
export const application = {
  component: component,
  viewModel: {
    ViewModel: ViewModel,
    ViewModelCollection: ViewModelCollection,
    InputViewModel: InputViewModel,
    BaseSheetViewModel: BaseSheetViewModel,
    BaseItemSheetViewModel: BaseItemSheetViewModel,
  },
  dialog: dialog,
  sheet: {
    BaseItemSheet: BaseItemSheet,
    LanguageItemSheet: LanguageItemSheet,
  },
  Tooltip: Tooltip,
  TEMPLATES: TEMPLATES,
  /**
   * Ensures sheets are registered.
   */
  init: async () => {
    await TEMPLATES._preloadHandlebarsTemplates();
    component.init();
    // Register sheet application classes. 
    FoundryWrapper.registerSheet({
      registry: FoundryWrapper.collections.documents.items,
      type: "language",
      sheet: LanguageItemSheet,
    });
  },
};
