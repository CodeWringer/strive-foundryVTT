import { StringUtil } from "../../common/util/string-utility.mjs";
import GameSystemSettingDeclaration from "./game-system-setting-declaration.mjs";
import GameSystemSettings from "./game-system-settings.mjs";
import { LIST_ITEM_EXPANSION_MODES } from "./list-item-expansion-modes.mjs";
import { SETTING_SCOPES } from "./setting-scopes.mjs";

/**
 * Defines the settings specific to a user. 
 * 
 * @static
 */
export const GameSystemUserSettings = {
  /**
   * @static
   * @type {String}
   * @readonly
   */
  KEY_USE_STRIVE_FONT: "userShowStriveFont",

  /**
   * @static
   * @type {String}
   * @readonly
   */
  KEY_TOGGLE_DEBUG: "userToggleDebug",

  /**
   * @static
   * @type {String}
   * @readonly
   */
  KEY_TOGGLE_REMINDERS: "userToggleReminders",

  /**
   * @static
   * @type {String}
   * @readonly
   */
  KEY_TOGGLE_UNUSABLE_EXPERTISE_VISIBILITY: "userToggleUnusableExpertiseVisibility",

  /**
   * @static
   * @type {String}
   * @readonly
   */
  KEY_LIST_ITEM_EXPANSION_MODE: "userListItemExpansionMode",

  /**
   * User settings initialization. To be called during the system's "ready" hook. 
   */
  init() {
    GameSystemSettings.addDeclaration(
      new GameSystemSettingDeclaration({
        key: GameSystemUserSettings.KEY_USE_STRIVE_FONT,
        name: game.i18n.localize("system.settings.fancyFont.label"),
        hint: game.i18n.localize("system.settings.fancyFont.hint"),
        scope: SETTING_SCOPES.USER,
        config: true,
        default: true,
        type: Boolean,
      }),
    );
    GameSystemSettings.addDeclaration(
      new GameSystemSettingDeclaration({
        key: GameSystemUserSettings.KEY_TOGGLE_DEBUG,
        name: game.i18n.localize("system.settings.toggleDebug.label"),
        hint: game.i18n.localize("system.settings.toggleDebug.hint"),
        scope: SETTING_SCOPES.USER,
        config: true,
        default: false,
        type: Boolean,
      }),
    );
    GameSystemSettings.addDeclaration(
      new GameSystemSettingDeclaration({
        key: GameSystemUserSettings.KEY_TOGGLE_REMINDERS,
        name: game.i18n.localize("system.settings.toggleReminders.label"),
        hint: game.i18n.localize("system.settings.toggleReminders.hint"),
        scope: SETTING_SCOPES.USER,
        config: true,
        default: true,
        type: Boolean,
      }),
    );
    GameSystemSettings.addDeclaration(
      new GameSystemSettingDeclaration({
        key: GameSystemUserSettings.KEY_TOGGLE_UNUSABLE_EXPERTISE_VISIBILITY,
        name: game.i18n.localize("system.settings.toggleExpertiseVisibility.label"),
        hint: game.i18n.localize("system.settings.toggleExpertiseVisibility.hint"),
        scope: SETTING_SCOPES.USER,
        config: true,
        default: true,
        type: Boolean,
      }),
    );
    GameSystemSettings.addDeclaration(
      new GameSystemSettingDeclaration({
        key: GameSystemUserSettings.KEY_LIST_ITEM_EXPANSION_MODE,
        name: game.i18n.localize("system.settings.listItemExpansionMode.label"),
        hint: game.i18n.localize("system.settings.listItemExpansionMode.hint"),
        scope: SETTING_SCOPES.USER,
        config: true,
        default: LIST_ITEM_EXPANSION_MODES.window.name,
        type: String,
        choices: {
          window: StringUtil.getLoca(LIST_ITEM_EXPANSION_MODES.window.localizableName),
          inline: StringUtil.getLoca(LIST_ITEM_EXPANSION_MODES.inline.localizableName),
        },
      }),
    );
  },
}
