import AbstractMigrator from "./abstract-migrator.mjs";
import VersionCode from "./version-code.mjs";
import { WorldSystemVersion } from "./world-system-version.mjs";

/**
 * An empty migrator, which doesn't have any work to do. 
 * 
 * Will be instantiated at run-time to create synthetic migrators. 
 */
export default class EmptyMigrator extends AbstractMigrator {
  /** @override */
  get fromVersion() { return this._fromVersion; }

  /** @override */
  get toVersion() { return this._toVersion; }
  
  /** @override */
  isApplicable() {
    const worldVersion = WorldSystemVersion.get();
    if (worldVersion.equals(this.fromVersion)
      || (worldVersion.greater(this.fromVersion) && worldVersion.lesser(this.toVersion))) {
      return true;
    }
    return false;
  }

  /**
   * 
   * @param {VersionCode} fromVersion 
   * @param {VersionCode} toVersion 
   */
  constructor(fromVersion, toVersion) {
    super();

    this._fromVersion = fromVersion;
    this._toVersion = toVersion;
  }

  /** @override */
  _doWork(args = {}) {
    // The empty migrator does nothing. 
  }
}
