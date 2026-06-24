// import HealthStatesSettingsDialog from "../../presentation/application/dialog/settings/health-settings/health-settings-dialog.mjs";
import GameSystemSettingDeclaration from "./game-system-setting-declaration.mjs";
import GameSystemSettings from "./game-system-settings.mjs";
import { SETTING_SCOPES } from "./setting-scopes.mjs";

/**
 * Defines the settings specific to a world. 
 * 
 * @static
 */
export const GameSystemWorldSettings = {
  /**
   * @static
   * @type {String}
   * @readonly
   */
  KEY_HEALTH_SETTINGS: "healthSettings",
 
  /**
   * @static
   * @type {String}
   * @readonly
   */
  KEY_AUTO_REFILL_ACTION_POINTS: "autoRefillActionPoints",
 
  /**
   * @static
   * @type {String}
   * @readonly
   */
  KEY_AUTO_REMOVE_SAME_COMBATANTS: "autoRemoveSameCombatants",
 
  /**
   * @static
   * @type {String}
   * @readonly
   */
  KEY_ENABLE_MOMENTUM_BAR: "enableMomentumBar",

  /**
   * World settings initialization. To be called during the system's "ready" hook. 
   * Must be called before 
   */
  init() {
    GameSystemSettings.addDeclaration(
      new GameSystemSettingDeclaration({
        key: GameSystemWorldSettings.KEY_HEALTH_SETTINGS,
        name: game.i18n.localize("system.settings.healthConditions.label"),
        hint: game.i18n.localize("system.settings.healthConditions.hint"),
        scope: SETTING_SCOPES.WORLD,
        config: false,
        default: {
          hidden: [],
        },
        type: Object,
        // menu: HealthStatesSettingsDialog, TODO
        restricted: true,
      }),
    );
    GameSystemSettings.addDeclaration(
      new GameSystemSettingDeclaration({
        key: GameSystemWorldSettings.KEY_AUTO_REFILL_ACTION_POINTS,
        name: game.i18n.localize("system.settings.autoActionPointRefill.label"),
        hint: game.i18n.localize("system.settings.autoActionPointRefill.hint"),
        scope: SETTING_SCOPES.WORLD,
        config: true,
        default: true,
        type: Boolean,
      }),
    );
    GameSystemSettings.addDeclaration(
      new GameSystemSettingDeclaration({
        key: GameSystemWorldSettings.KEY_AUTO_REMOVE_SAME_COMBATANTS,
        name: game.i18n.localize("system.settings.autoRemoveSameCombatants.label"),
        hint: game.i18n.localize("system.settings.autoRemoveSameCombatants.hint"),
        scope: SETTING_SCOPES.WORLD,
        config: true,
        default: true,
        type: Boolean,
      }),
    );
    GameSystemSettings.addDeclaration(
      new GameSystemSettingDeclaration({
        key: GameSystemWorldSettings.KEY_ENABLE_MOMENTUM_BAR,
        name: game.i18n.localize("system.settings.enableMomentumBar.label"),
        hint: game.i18n.localize("system.settings.enableMomentumBar.hint"),
        scope: SETTING_SCOPES.WORLD,
        config: true,
        default: true,
        type: Boolean,
      }),
    );
  }
}
