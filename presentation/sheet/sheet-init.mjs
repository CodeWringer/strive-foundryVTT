import FoundryWrapper from "../../foundry-interop/foundry-wrapper.mjs";
import { LanguageItemSheet } from "./item/language/language-item-sheet.mjs";

/**
 * @abstract
 */
export default class SheetInitializer {
  /**
   * Ensures the global config contains the sheet declarations. 
   * 
   * @static
   */
  static register() {
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

  }
}
