import VersionCode from "./version-code.mjs";
import WorldSystemVersion from "./world-system-version.mjs";

/**
 * @summary
 * Represents a world data migrator. 
 * 
 * @description
 * This type can migrate world data. The 'targetVersion' getter returns the version that the world system 
 * version **must be equal to**, in order for this migrator to be able to do its work. If the version is 
 * any different from the targeted one, **no work** can be done!
 * 
 * Once the migrator is done with its work, it will automatically update the world's system version to 
 * its defined migrated version. NOTE: In order for this to work, the migrator sets a world scope setting 
 * with which to track the world system version. 
 * 
 * Implementing migrators **must** provide implementations for 'targetVersion', 'migratedVersion' and 
 * '_doWork'!
 * 
 * @abstract
 */
export default class AbstractMigrator {
  /**
   * The world version must be **equal** to this, in order for this migrator to be able to do its work. 
   * 
   * Implementing types **must** override this and provide an actual version number!
   * @type {VersionCode}
   * @protected
   * @readonly
   * @virtual
   */
  get targetVersion() { throw new Error("NotImplementedException"); };
  
  /**
   * The world version must be **equal** to this, in order for this migrator to be able to do its work. 
   * 
   * Implementing types **must** override this and provide an actual version number!
   * @type {VersionCode}
   * @protected
   * @readonly
   * @virtual
   */
  get migratedVersion() { throw new Error("NotImplementedException"); };

  /**
   * @type {WorldSystemVersion}
   * @private
   */
  _worldSystemVersion = new WorldSystemVersion();

  /**
   * Returns true, if this migrator can be applied to the current world system version. 
   * @returns {Boolean} True, if this migrator can be applied to the current world system version. 
   */
  isApplicable() {
    const version = this._worldSystemVersion.version;
    
    const majorApplies = version.major === this.targetVersion.major;
    const minorApplies = version.minor === this.targetVersion.minor;
    const patchApplies = version.patch === this.targetVersion.patch;

    if (majorApplies === true && minorApplies === true && patchApplies === true) {
      return true;
    }
    return false;
  }
  
  /**
   * Begins the migration process. 
   * @param {Object|undefined} args An optional arguments object. 
   * @async
   */
  async migrate(args = {}) {
    await this._doWork(args);
    
    // Update world system version. 
    this._worldSystemVersion.version = this.migratedVersion;
    this._worldSystemVersion.save();
  }
  
  /**
   * Does the migration work. 
   * 
   * Implementing types **must** override this and provide an implementation!
   * @param {Object|undefined} args An optional arguments object. 
   * @async
   * @abstract
   * @protected
   */
  async _doWork(args = {}) {
    // Inheriting classes **must** implement this!
    throw new Error("NotImplementedException");
  }
}
