import { ChatUtil } from "./chat-utility.mjs";
import { ChoicesUtil } from "./choices-utility.mjs";
import ClipboardHandler from "./clipboard-handler.mjs";
import DragData from "./drag-drop/drag-data.mjs";
import { DragDropHandler } from "./drag-drop/drag-drop-handler.mjs";
import { HANDLEBARS_GLOBALS } from "./handlebars-globals.mjs";
import { KEY_CODES, MODIFIER_KEY_CODES } from "./keyboard/key-codes.mjs";
import { KEYBOARD } from "./keyboard/keyboard.mjs";
import { Rect } from "./rect.mjs";
import { SheetUtil } from "./sheet-utility.mjs";

/**
 * Wraps the `presentation.util` module. 
 */
export const util = {
  keyboard: {
    KEY_CODES: KEY_CODES,
    MODIFIER_KEY_CODES: MODIFIER_KEY_CODES,
    KEYBOARD: KEYBOARD,
  },
  ClipboardHandler: ClipboardHandler,
  DragData: DragData,
  DragDropHandler: DragDropHandler,
  HANDLEBARS_GLOBALS: HANDLEBARS_GLOBALS,
  Rect: Rect,
  sheet: SheetUtil,
  chat: ChatUtil,
  choices: ChoicesUtil,
  /**
   * Initialization to be called during the system's "ready" hook. 
   */
  ready: () => {
    KEYBOARD.init();
    DragDropHandler.ready();
  },
  setup: () => {
    // Initialize global Handlebars helpers and partials.
    HANDLEBARS_GLOBALS.initHandlebarsHelpers();
  },
};
