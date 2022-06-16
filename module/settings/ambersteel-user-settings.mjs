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

  constructor()
  {
    super();

    this._settings.push(
      new AmbersteelSetting({
        key: AmbersteelUserSettings.KEY_SHOW_FANCY_FONT,
        name: game.i18n.localize("ambersteel.settings.fancyFont.name"),
        hint: game.i18n.localize("ambersteel.settings.fancyFont.hint"),
        scope: SettingScopes.USER,
        config: true,
        default: true,
        type: Boolean,
      }),
    );
  }
}
