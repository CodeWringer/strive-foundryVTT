import AmbersteelSetting from "./ambersteel-setting.mjs";
import AmbersteelSettings from "./ambersteel-settings.mjs";
import { SettingScopes } from "./setting-scopes.mjs";

/**
 * Defines the settings specific to a user. 
 */
export default class AmbersteelUserSettings extends AmbersteelSettings {
  /**
   * @static
   * @type {String}
   * @readonly
   */
  static get KEY_SHOW_FANCY_FONT() { return "showFancyFont"; }

  /**
   * @static
   * @type {String}
   * @readonly
   */
  static get KEY_TOGGLE_DEBUG() { return "toggleDebug"; }

  constructor()
  {
    super();

    this._settings.push(
      new AmbersteelSetting({
        key: AmbersteelUserSettings.KEY_SHOW_FANCY_FONT,
        name: game.i18n.localize("ambersteel.settings.fancyFont.label"),
        hint: game.i18n.localize("ambersteel.settings.fancyFont.hint"),
        scope: SettingScopes.USER,
        config: true,
        default: true,
        type: Boolean,
      }),
      new AmbersteelSetting({
        key: AmbersteelUserSettings.KEY_TOGGLE_DEBUG,
        name: game.i18n.localize("ambersteel.settings.toggleDebug.label"),
        hint: game.i18n.localize("ambersteel.settings.toggleDebug.hint"),
        scope: SettingScopes.USER,
        config: true,
        default: false,
        type: Boolean,
      }),
    );
  }
}
