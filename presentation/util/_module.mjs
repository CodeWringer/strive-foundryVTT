import ClipboardHandler from "./clipboard-handler.mjs";
import { DragDropHandler } from "./drag-drop-handler.mjs";
import { HANDLEBARS_GLOBALS } from "./handlebars-globals.mjs";
import { KEY_CODES } from "./keyboard/key-codes.mjs";
import { KEYBOARD } from "./keyboard/keyboard.mjs";
import SendToChatHandler from "./send-to-chat-handler.mjs";

export {
  KEY_CODES,
  KEYBOARD,
  ClipboardHandler,
  DragDropHandler,
  HANDLEBARS_GLOBALS,
  SendToChatHandler,
};

/**
 * Wraps the `presentation.util` module. 
 */
export const util = {
  keyboard: {
    KEY_CODES: KEY_CODES,
    KEYBOARD: KEYBOARD,
  },
  ClipboardHandler: ClipboardHandler,
  DragDropHandler: DragDropHandler,
  HANDLEBARS_GLOBALS: HANDLEBARS_GLOBALS,
  SendToChatHandler: SendToChatHandler,
  /**
   * Initialization to be called during the system's "ready" hook. 
   */
  ready: () => {
    KEYBOARD.init();
  },
  setup: () => {
    // Initialize global Handlebars helpers and partials.
    HANDLEBARS_GLOBALS.initHandlebarsHelpers();
    HANDLEBARS_GLOBALS.initHandlebarsPartials();
  },
};
