import FoundryWrapper from "../../foundry-interop/foundry-wrapper.mjs";
import { component } from "./component/_module.mjs";
import Tooltip from "./component/tooltip/tooltip.mjs";
import BaseItemSheetViewModel from "./item/base/sheet/base-item-sheet-viewmodel.mjs";
import BaseItemSheet from "./item/base/sheet/base-item-sheet.mjs";
import LanguageItemSheet from "./item/language/language-item-sheet.mjs";
import { TEMPLATES } from "./templates.mjs";
import BaseSheetViewModel from "./view-model/base-sheet-viewmodel.mjs";
import InputViewModel from "./view-model/input-view-model.mjs";
import ViewModelCollection from "./view-model/view-model-collection.mjs";
import ViewModel, { ViewModelToolTipDefinition } from "./view-model/view-model.mjs";
import { dialog } from "./dialog/_module.mjs";
import LanguageContentViewModel from "./item/language/language-content-viewmodel.mjs";
import LanguageItemSheetViewModel from "./item/language/language-item-sheet-viewmodel.mjs";
import InjuryItemSheet from "./item/injury/injury-item-sheet.mjs";
import InjuryItemSheetViewModel from "./item/injury/injury-item-sheet-viewmodel.mjs";
import InjuryContentViewModel from "./item/injury/injury-content-viewmodel.mjs";
import { ITEM_TYPES } from "../../business/model/domain/const/item-types.mjs";

/**
 * Wraps the `presentation.application` module, which contains all dedicated windows, 
 * dialogs and sheets. 
 */
export const application = {
  component: component,
  viewModel: {
    ViewModel: ViewModel,
    ViewModelToolTipDefinition: ViewModelToolTipDefinition,
    ViewModelCollection: ViewModelCollection,
    InputViewModel: InputViewModel,
    base: {
      BaseSheetViewModel: BaseSheetViewModel,
      BaseItemSheetViewModel: BaseItemSheetViewModel,
    },
    injury: {
      InjuryItemSheetViewModel: InjuryItemSheetViewModel,
      InjuryContentViewModel: InjuryContentViewModel,
    },
    language: {
      LanguageItemSheetViewModel: LanguageItemSheetViewModel,
      LanguageContentViewModel: LanguageContentViewModel,
    },
  },
  dialog: dialog,
  sheet: {
    BaseItemSheet: BaseItemSheet,
    InjuryItemSheet: InjuryItemSheet,
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
      type: ITEM_TYPES.injury,
      sheet: InjuryItemSheet,
    });
    FoundryWrapper.registerSheet({
      registry: FoundryWrapper.collections.documents.items,
      type: ITEM_TYPES.language,
      sheet: LanguageItemSheet,
    });
  },
};
