import FoundryWrapper from "../../foundry-interop/foundry-wrapper.mjs";
import { LanguageItemSheet } from "./sheet/language/language-item-sheet.mjs";

export {
  LanguageItemSheet,
};

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

    // TODO #739 remove
    // // Register sheet application classes. 
    // Actors.unregisterSheet("core", ActorSheet);
    // Actors.registerSheet(SYSTEM_ID, GameSystemActorSheet, { makeDefault: true });

    // Items.unregisterSheet("core", ItemSheet);
    // Items.registerSheet(SYSTEM_ID, GameSystemItemSheet, { makeDefault: true });
  },
};
