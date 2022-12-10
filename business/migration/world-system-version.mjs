import AmbersteelSettings from "../setting/ambersteel-settings.mjs";
import VersionCode from "./version-code.mjs";

/**
 * Provides a means to read/write the world's global system version. 
 * 
 * @private
 */
class WorldSystemVersionType {
  /**
   * The FoundryVTT setting key for the system. 
   * 
   * This value must match the 'name' field defined in 'system.json'. 
   * @type {String}
   * @private
   * @readonly
   */
  get _settingNamespace() { return AmbersteelSettings.SETTINGS_NAMESPACE; }
  
  /**
   * The FoundryVTT setting key for the world version. 
   * @type {String}
   * @private
   * @readonly
   */
  get _settingKey() { return "worldSystemVersion"; }
  
  /**
   * The FoundryVTT setting name for the world version. 
   * @type {String}
   * @private
   * @readonly
   */
  get _settingName() { return "worldSystemVersion"; }

  /**
   * Gets the version represented by this object. 
   * @type {VersionCode}
   */
  get version() { return this._get(); }
  /**
   * Sets the version represented by this object. 
   * 
   * **IMPORTANT**: This automatically sets the 
   * @param {VersionCode} value
   */
  set version(value) { this._set(value); }

  /**
   * Sets and persists the given version as the world system version. 
   * @param {VersionCode} version The version to set. 
   */
  _set(version) {
    this._ensureSetting();

    // Set the world system version.
    game.settings.set(this._settingNamespace, this._settingKey, version.toString()); 
  }

  /**
   * Returns the world system version. 
   * @returns {VersionCode}
   * @private
   */
  _get() {
    this._ensureSetting();

    const worldSystemVersion = game.settings.get(this._settingNamespace, this._settingKey); 
    return VersionCode.fromString(worldSystemVersion);
  }

  /**
   * Ensures the world system version is a registered world setting. 
   * 
   * IMPORTANT: This **must** be called internally, before every attempt to access 
   * the setting via `game.settings.get` or `game.settings.set`! 
   * @private
   */
  _ensureSetting() {
    const systemVersion = VersionCode.fromString(game.system.data.version);

    // Ensures the setting is registered and available. 
    game.settings.register(this._settingNamespace, this._settingKey, {
      name: this._settingName,
      hint: "Used to know if world migration is necessary",
      scope: "world",
      config: false,
      default: systemVersion.toString(), 
      type: String,
    });
  }
}

/**
 * Provides a means to read/write the world's global system version. 
 * @type {WorldSystemVersionType}
 * @constant
 */
export const WorldSystemVersion = new WorldSystemVersionType();
