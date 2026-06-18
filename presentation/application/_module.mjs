import FoundryWrapper from "../../foundry-interop/foundry-wrapper.mjs";
import { LanguageItemSheet } from "./domain/language/language-item-sheet.mjs";

export {
  LanguageItemSheet,
};

/**
 * Wraps the `presentation.application` module, which contains all dedicated windows, 
 * dialogs and sheets. 
 */
export const application = {
  dialog: {
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
