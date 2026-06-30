import { common } from "../../common/_module.mjs";
import { SYSTEM_ID } from "../../system-id.mjs";
import GameSystemSettingDeclaration from "./game-system-setting-declaration.mjs";
import { SETTING_SCOPES } from "./setting-scopes.mjs";

/**
 * Repository singleton through which game settings can be declared, 
 * accessed and manipulated. 
 * 
 * HOWEVER instead of using this class, you are instead expected to use 
 * `GameSystemSetting` to access specific settings. 
 * 
 * BUT you should use this class to declare new settings, for example if you are 
 * developing a module that needs to introduce new settings. For that, use the 
 * `addDeclaration()` function. Once you have added all your new settings, call 
 * the `ready()` function, which will ensure your settings are properly initialized. 
 * 
 * @static
 */
export default class GameSystemSettings {
  /**
  * The FoundryVTT setting key for the system. 
  * 
  * This value **must** match the 'name' field defined in 'system.json'. 
  * 
  * @type {String}
  * @static
  * @readonly
  */
  static get SETTINGS_NAMESPACE() { return SYSTEM_ID; }

  /**
   * A list of registered world settings. 
   * 
   * @type {Array<GameSystemSettingDeclaration>}
   * @protected
   * @static
   */
  static _worldSettings = [];

  /**
   * A list of registered user settings. 
   * 
   * @type {Array<GameSystemSettingDeclaration>}
   * @protected
   * @static
   */
  static _userSettings = [];

  /**
   * A list of registered user setting templates. 
   * 
   * @type {Array<GameSystemSettingDeclaration>}
   * @protected
   * @static
   */
  static _userSettingTemplates = [];

  /**
   * Sets the value of the setting matching the given key. 
   * 
   * @param {String} key Key of the setting to set. 
   * @param {Any} value The value to set. 
   * @static
   */
  static set(key, value) {
    this._ensureSetting(key);
    game.settings.set(GameSystemSettings.SETTINGS_NAMESPACE, key, value);
  }

  /**
   * Returns the value of the setting matching the given key. 
   * 
   * @param {String} key Key of the setting to get. 
   * @returns {Any}
   * @static
   */
  static get(key) {
    this._ensureSetting(key);
    return game.settings.get(GameSystemSettings.SETTINGS_NAMESPACE, key);
  }

  /**
   * Adds a new setting declaration, but ignores duplicates.
   * 
   * @param {GameSystemSettingDeclaration} settingDeclaration 
   * @returns {Boolean} `true`, if the setting declaration was added. 
   * @static
   */
  static addDeclaration(settingDeclaration) {
    if (settingDeclaration.scope === SETTING_SCOPES.USER) {
      const setting = GameSystemSettings._userSettingTemplates.find(it => it.key === settingDeclaration.key);
      if (common.util.validation.isDefined(setting)) return false;
      
      GameSystemSettings._userSettingTemplates.push(settingDeclaration);
    } else {
      const setting = GameSystemSettings._worldSettings.find(it => it.key === settingDeclaration.key);
      if (common.util.validation.isDefined(setting)) return false;

      GameSystemSettings._worldSettings.push(settingDeclaration);
    }
    return true;
  }

  /**
   * Returns the setting declaration by the given key. 
   * 
   * @param {String} key 
   * @returns {GameSystemSettingDeclaration | undefined}
   * @static
   */
  static getDeclaration(key) {
    const allSettings = GameSystemSettings._worldSettings
      .concat(GameSystemSettings._userSettingTemplates)
      .concat(GameSystemSettings._userSettings);
    return allSettings.find(it => it.key === key);
  }

  /**
   * @summary
   * Ensures the setting whose key matches the given key, is registered. 
   * 
   * @description
   * **IMPORTANT**: This **must** be called internally, before any attempt to access 
   * the setting via `game.settings.get` or `game.settings.set` is made! 
   * 
   * @param {String} key Key of the setting to set. 
   * 
   * @private
   * @static
   */
  static _ensureSetting(key) {
    const allSettings = GameSystemSettings._worldSettings
      .concat(GameSystemSettings._userSettingTemplates)
      .concat(GameSystemSettings._userSettings);
    const setting = allSettings.find(it => it.key === key);

    if (setting === undefined) {
      throw new Error(`Failed to get setting with key '${key}'`);
    }

    // Ensures the setting is registered and available. 
    game.settings.register(GameSystemSettings.SETTINGS_NAMESPACE, key, {
      name: setting.name,
      hint: setting.hint,
      scope: "world", // Hard-coded because all settings are to be persisted server-side.
      config: setting.config,
      default: setting.default,
      type: setting.type,
    });

    // If the setting requires a menu, ensure it is registered. 
    if (setting.menu !== undefined) {
      game.settings.registerMenu(GameSystemSettings.SETTINGS_NAMESPACE, `${key}Menu`, {
        name: setting.name,
        hint: setting.hint,
        label: setting.name,
        icon: setting.icon,
        type: setting.menu,
        restricted: setting.restricted,
      });
    }
  }

  /**
   * Ensures all settings are registered. 
   * 
   * To be called once and every time during the system's "ready" hook. 
   * @static
   */
  static ready() {
    // Ensure user specific setting declarations. 
    // These are based on the template user setting declarations. 
    // To avoid modifying the same collection we're reading from, 
    // a cached version thereof is used. 
    for (const setting of GameSystemSettings._userSettingTemplates) {
      const newKey = `${game.userId}-${setting.key}`;
      const newSettingDeclaration = new GameSystemSettingDeclaration({
        key: newKey,
        name: setting.name,
        scope: setting.scope,
        hint: setting.hint,
        config: setting.config,
        default: setting.default,
        type: setting.type,
        menu: setting.menu,
        icon: setting.icon,
        restricted: setting.restricted,
      });
      GameSystemSettings._userSettings.push(newSettingDeclaration);
    }

    for (const setting of GameSystemSettings._worldSettings) {
      GameSystemSettings._ensureSetting(setting.key);
    }
    for (const setting of GameSystemSettings._userSettings) {
      GameSystemSettings._ensureSetting(setting.key);
    }
  }
}
