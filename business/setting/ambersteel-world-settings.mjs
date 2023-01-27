import HealthStatesSettingsDialog from "../../presentation/dialog/settings/health-states/health-states-settings-dialog.mjs";
import AmbersteelSetting from "./ambersteel-setting.mjs";
import AmbersteelSettings from "./ambersteel-settings.mjs";
import { SettingScopes } from "./setting-scopes.mjs";

/**
 * Defines the settings specific to a user. 
 */
export default class AmbersteelWorldSettings extends AmbersteelSettings {
  /**
   * @static
   * @type {String}
   * @readonly
   */
  static get KEY_CUSTOM_HEALTH_STATES() { return "customHealthStates"; }

  constructor() {
    super();

    this._settings.push(
      new AmbersteelSetting({
        key: AmbersteelWorldSettings.KEY_CUSTOM_HEALTH_STATES,
        name: game.i18n.localize("ambersteel.settings.healthStates.label"),
        hint: game.i18n.localize("ambersteel.settings.healthStates.hint"),
        scope: SettingScopes.WORLD,
        config: false,
        default: {
          hidden: [],
          custom: [],
        },
        type: Object,
        menu: HealthStatesSettingsDialog,
        restricted: true,
      }),
    );
  }
}
