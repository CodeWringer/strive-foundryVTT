import FoundryWrapper from "../../foundry-interop/foundry-wrapper.mjs";
import { component } from "./component/_module.mjs";
import Tooltip from "./component/tooltip/tooltip.mjs";
import DynamicInputDefinition from "./dialog/dynamic-input-dialog/dynamic-input-definition.mjs";
import DynamicInputDialogViewModel from "./dialog/dynamic-input-dialog/dynamic-input-dialog-viewmodel.mjs";
import DynamicInputDialog from "./dialog/dynamic-input-dialog/dynamic-input-dialog.mjs";
import { LanguageItemSheet } from "./domain/item/language/language-item-sheet.mjs";
import BaseSheetViewModel from "./view-model/base-sheet-viewmodel.mjs";
import InputViewModel from "./view-model/input-view-model.mjs";
import ViewModelCollection from "./view-model/view-model-collection.mjs";
import ViewModel from "./view-model/view-model.mjs";

export {
  ViewModel,
  ViewModelCollection,
  InputViewModel,
  component,
  DynamicInputDefinition,
  DynamicInputDialogViewModel,
  DynamicInputDialog,
  BaseSheetViewModel,
  LanguageItemSheet,
  Tooltip,
};

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
  },
  dialog: {
    dynamic: {
      DynamicInputDefinition: DynamicInputDefinition,
      DynamicInputDialogViewModel: DynamicInputDialogViewModel,
      DynamicInputDialog: DynamicInputDialog,
    },
  },
  sheet: {
    LanguageItemSheet: LanguageItemSheet,
  },
  Tooltip: Tooltip,
  /**
   * Ensures sheets are registered.
   */
  init: () => {
    FoundryWrapper.registerSheet({
      registry: FoundryWrapper.collections.documents.items,
      type: "language",
      sheet: LanguageItemSheet,
    });

    // TODO #739
    // // Register sheet application classes. 
    // Actors.unregisterSheet("core", ActorSheet);
    // Actors.registerSheet(SYSTEM_ID, GameSystemActorSheet, { makeDefault: true });

    // Items.unregisterSheet("core", ItemSheet);
    // Items.registerSheet(SYSTEM_ID, GameSystemItemSheet, { makeDefault: true });
  },
};
