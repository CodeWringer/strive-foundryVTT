/**
 * Base class of Migrators. 
 * @abstract
 */
export default class AbstractMigrator {
  /**
   * Returns true, if this migrator can be applied to the currently installed version of the system. 
   * @returns {Boolean} True, if this migrator can be applied to the currently installed version of the system. 
   * @abstract
   */
  isApplicable() {
    // Inheriting classes must implement this!
    throw "Not implemented!";
  }
  
  /**
   * Begins the migration process. 
   * @param {Object|undefined} args An optional arguments object. 
   * @async
   * @abstract
   */
  async migrate(args = {}) {
    // Inheriting classes must implement this!
    throw "Not implemented!";
  }

  /**
   * Returns the current version code of the installed and loaded system. 
   * @returns {VersionCode}
   * @virtual
   */
  getCurrentVersion() {
    const versionCodes = game.system.data.version.split(".");
    return new VersionCode(parseInt(versionCodes[0]), parseInt(versionCodes[1]), parseInt(versionCodes[2]));
  }
}

/**
 * Represents a version code, with major, minor and revision version numbers. 
 * @property {Number} major This indicates a critical, breaking change. 
 * @property {Number} minor This indicates a significant change or new feature. 
 * @property {Number} revision This indicates a smaller change, with little impact. 
 */
export class VersionCode {
  constructor(major, minor, revision) {
    this.major = major;
    this.minor = minor;
    this.revision = revision;
  }
}