import VersionCode from "./version-code.mjs";

/**
 * Provides a means to read/write the current world's system version. 
 */
export default class WorldSystemVersion {
  /**
   * The FoundryVTT setting key for the system. 
   * @type {String}
   * @private
   * @readonly
   */
  get _settingKeyAmbersteel() { return "ambersteel"; };
  
  /**
   * The FoundryVTT setting key for the world version. 
   * @type {String}
   * @private
   * @readonly
   */
  get _settingKeyWorldVersion() { return `worldSystemVersion-${game.world.id}`; };

  /**
   * @type {VersionCode}
   */
  version = undefined;

  constructor() {
    this.version = this._get();
  }

  save() {
    // Ensure current world system version is trackable. 
    try {
      game.settings.get(this._settingKeyAmbersteel, this._settingKeyWorldVersion); 
    } catch (error) {
      game.settings.register(this._settingKeyAmbersteel, this._settingKeyWorldVersion, {
        name: "World Version",
        hint: "Used to know if world migration is necessary",
        scope: "world",
        config: false,
        default: this.version.toString(), 
        type: String,
      });
    }

    // Set the world system version.
    game.settings.set(this._settingKeyAmbersteel, this._settingKeyWorldVersion, this.version.toString()); 
  }

  /**
   * Returns the current version code of the installed and loaded system. 
   * @returns {VersionCode}
   * @private
   */
  _get() {
    const systemVersion = VersionCode.fromString(game.system.data.version);

    try {
      // Get world version from settings, if possible. 
      const worldSystemVersion = game.settings.get(this._settingKeyAmbersteel, this._settingKeyWorldVersion); 
      return VersionCode.fromString(worldSystemVersion);
    } catch (error) {
      return systemVersion;
    }
  }
}
