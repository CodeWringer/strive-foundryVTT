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
import IllnessContentViewModel from "./item/illness/illness-content-viewmodel.mjs";
import IllnessItemSheetViewModel from "./item/illness/illness-item-sheet-viewmodel.mjs";
import IllnessItemSheet from "./item/illness/illness-item-sheet.mjs";
import MutationContentViewModel from "./item/mutation/mutation-content-viewmodel.mjs";
import MutationItemSheetViewModel from "./item/mutation/mutation-item-sheet-viewmodel.mjs";
import MutationItemSheet from "./item/mutation/mutation-item-sheet.mjs";
import HealthConditionContentViewModel from "./item/health-condition/health-condition-content-viewmodel.mjs";
import HealthConditionItemSheetViewModel from "./item/health-condition/health-condition-item-sheet-viewmodel.mjs";
import HealthConditionItemSheet from "./item/health-condition/health-condition-item-sheet.mjs";
import HealthConditionHeaderViewModel from "./item/health-condition/health-condition-header-viewmodel.mjs";
import InjuryHeaderViewModel from "./item/injury/injury-header-viewmodel.mjs";
import IllnessHeaderViewModel from "./item/illness/illness-header-viewmodel.mjs";
import MutationHeaderViewModel from "./item/mutation/mutation-header-viewmodel.mjs";
import LanguageHeaderViewModel from "./item/language/language-header-viewmodel.mjs";

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
      InjuryHeaderViewModel: InjuryHeaderViewModel,
      InjuryContentViewModel: InjuryContentViewModel,
    },
    illness: {
      IllnessContentViewModel: IllnessContentViewModel,
      IllnessHeaderViewModel: IllnessHeaderViewModel,
      IllnessItemSheetViewModel: IllnessItemSheetViewModel,
    },
    mutation: {
      MutationContentViewModel: MutationContentViewModel,
      MutationHeaderViewModel: MutationHeaderViewModel,
      MutationItemSheetViewModel: MutationItemSheetViewModel,
    },
    language: {
      LanguageItemSheetViewModel: LanguageItemSheetViewModel,
      LanguageHeaderViewModel: LanguageHeaderViewModel,
      LanguageContentViewModel: LanguageContentViewModel,
    },
    healthCondition: {
      HealthConditionContentViewModel: HealthConditionContentViewModel,
      HealthConditionHeaderViewModel: HealthConditionHeaderViewModel,
      HealthConditionItemSheetViewModel: HealthConditionItemSheetViewModel,
    },
  },
  dialog: dialog,
  sheet: {
    BaseItemSheet: BaseItemSheet,
    InjuryItemSheet: InjuryItemSheet,
    IllnessItemSheet: IllnessItemSheet,
    MutationItemSheet: MutationItemSheet,
    LanguageItemSheet: LanguageItemSheet,
    HealthConditionItemSheet: HealthConditionItemSheet,
  },
  Tooltip: Tooltip,
  TEMPLATES: TEMPLATES,
  /**
   * Ensures sheets are registered.
   */
  init: async () => {
    await TEMPLATES._preloadHandlebarsTemplates();
    component.init();
    dialog.init();
    // Register sheet application classes. 
    FoundryWrapper.registerSheet({
      registry: FoundryWrapper.collections.documents.items,
      type: ITEM_TYPES.injury,
      sheet: InjuryItemSheet,
    });
    FoundryWrapper.registerSheet({
      registry: FoundryWrapper.collections.documents.items,
      type: ITEM_TYPES.illness,
      sheet: IllnessItemSheet,
    });
    FoundryWrapper.registerSheet({
      registry: FoundryWrapper.collections.documents.items,
      type: ITEM_TYPES.mutation,
      sheet: MutationItemSheet,
    });
    FoundryWrapper.registerSheet({
      registry: FoundryWrapper.collections.documents.items,
      type: ITEM_TYPES.language,
      sheet: LanguageItemSheet,
    });
    FoundryWrapper.registerSheet({
      registry: FoundryWrapper.collections.documents.items,
      type: ITEM_TYPES.health_condition,
      sheet: HealthConditionItemSheet,
    });
  },
};
