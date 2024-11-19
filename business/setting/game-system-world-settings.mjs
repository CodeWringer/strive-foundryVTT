import HealthStatesSettingsDialog from "../../presentation/dialog/settings/health-states/health-states-settings-dialog.mjs";
import GameSystemSetting from "./game-system-setting.mjs";
import GameSystemSettings from "./game-system-settings.mjs";
import { SettingScopes } from "./setting-scopes.mjs";

/**
 * Defines the settings specific to a world. 
 */
export default class GameSystemWorldSettings extends GameSystemSettings {
  /**
   * @static
   * @type {String}
   * @readonly
   */
  static get KEY_CUSTOM_HEALTH_STATES() { return "customHealthStates"; }
 
  /**
   * @static
   * @type {String}
   * @readonly
   */
  static get KEY_AUTO_REFILL_ACTION_POINTS() { return "autoRefillActionPoints"; }
 
  /**
   * @static
   * @type {String}
   * @readonly
   */
  static get KEY_AUTO_REMOVE_SAME_COMBATANTS() { return "autoRemoveSameCombatants"; }

  constructor() {
    super();

    this._settings.push(
      new GameSystemSetting({
        key: GameSystemWorldSettings.KEY_CUSTOM_HEALTH_STATES,
        name: game.i18n.localize("system.settings.healthStates.label"),
        hint: game.i18n.localize("system.settings.healthStates.hint"),
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
      new GameSystemSetting({
        key: GameSystemWorldSettings.KEY_AUTO_REFILL_ACTION_POINTS,
        name: game.i18n.localize("system.settings.autoActionPointRefill.label"),
        hint: game.i18n.localize("system.settings.autoActionPointRefill.hint"),
        scope: SettingScopes.WORLD,
        config: true,
        default: true,
        type: Boolean,
      }),
      new GameSystemSetting({
        key: GameSystemWorldSettings.KEY_AUTO_REMOVE_SAME_COMBATANTS,
        name: game.i18n.localize("system.settings.autoRemoveSameCombatants.label"),
        hint: game.i18n.localize("system.settings.autoRemoveSameCombatants.hint"),
        scope: SettingScopes.WORLD,
        config: true,
        default: true,
        type: Boolean,
      }),
    );
  }
}
