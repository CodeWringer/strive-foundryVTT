import GameSystemSetting from "./game-system-setting.mjs";
import GameSystemSettings from "./game-system-settings.mjs";
import { SettingScopes } from "./setting-scopes.mjs";

/**
 * Defines the settings specific to a user. 
 */
export default class GameSystemUserSettings extends GameSystemSettings {
  /**
   * @static
   * @type {String}
   * @readonly
   */
  static get KEY_SHOW_FANCY_FONT() { return "userShowFancyFont"; }

  /**
   * @static
   * @type {String}
   * @readonly
   */
  static get KEY_TOGGLE_DEBUG() { return "userToggleDebug"; }

  /**
   * @static
   * @type {String}
   * @readonly
   */
  static get KEY_TOGGLE_REMINDERS() { return "userToggleReminders"; }

  constructor() {
    super();

    this._settings.push(
      new GameSystemSetting({
        key: GameSystemUserSettings.KEY_SHOW_FANCY_FONT,
        name: game.i18n.localize("system.settings.fancyFont.label"),
        hint: game.i18n.localize("system.settings.fancyFont.hint"),
        scope: SettingScopes.USER,
        config: true,
        default: true,
        type: Boolean,
      }),
      new GameSystemSetting({
        key: GameSystemUserSettings.KEY_TOGGLE_DEBUG,
        name: game.i18n.localize("system.settings.toggleDebug.label"),
        hint: game.i18n.localize("system.settings.toggleDebug.hint"),
        scope: SettingScopes.USER,
        config: true,
        default: false,
        type: Boolean,
      }),
      new GameSystemSetting({
        key: GameSystemUserSettings.KEY_TOGGLE_REMINDERS,
        name: game.i18n.localize("system.settings.toggleReminders.label"),
        hint: game.i18n.localize("system.settings.toggleReminders.hint"),
        scope: SettingScopes.USER,
        config: true,
        default: true,
        type: Boolean,
      }),
    );
  }
}
