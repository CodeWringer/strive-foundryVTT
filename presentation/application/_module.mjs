import FoundryWrapper from "../../foundry-interop/foundry-wrapper.mjs";
import DynamicInputDefinition from "./dialog/dynamic-input-dialog/dynamic-input-definition.mjs";
import DynamicInputDialogViewModel from "./dialog/dynamic-input-dialog/dynamic-input-dialog-viewmodel.mjs";
import DynamicInputDialog from "./dialog/dynamic-input-dialog/dynamic-input-dialog.mjs";
import { LanguageItemSheet } from "./domain/item/language/language-item-sheet.mjs";

export {
  LanguageItemSheet,
  DynamicInputDefinition,
  DynamicInputDialogViewModel,
  DynamicInputDialog,
};

/**
 * Wraps the `presentation.application` module, which contains all dedicated windows, 
 * dialogs and sheets. 
 */
export const application = {
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
