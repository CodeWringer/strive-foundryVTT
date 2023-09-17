import { MIGRATORS } from './migrators.mjs';
// Imports for the migrators, to populate the `MIGRATORS` list. 
import './migrators/migrator_0-3-0_0-3-1.mjs';
import './migrators/migrator_0-3-1_1-0-0.mjs';
import './migrators/migrator_1-0-0_1-1-0.mjs';
import './migrators/migrator_1-1-0_1-2-2.mjs';
import './migrators/migrator_1-2-2_1-3-0.mjs';
import './migrators/migrator_1-3-0_1-3-1.mjs';
import './migrators/migrator_1-3-1_1-3-2.mjs';
import './migrators/migrator_1-3-2_1-4-1.mjs';
import './migrators/migrator_1-4-1_1-5-0.mjs';
import './migrators/migrator_1-5-0_1-5-1.mjs';
import './migrators/migrator_1-5-1_1-5-2.mjs';
import './migrators/migrator_1-5-2_1-5-3.mjs';
import './migrators/migrator_1-5-3_1-5-4.mjs';
import './migrators/migrator_1-5-4_1-5-5.mjs';
import './migrators/migrator_1-5-5_1-5-6.mjs';
import './migrators/migrator_1-5-6_1-5-7.mjs';
// Other imports. 
import VersionCode from './version-code.mjs';

/**
 * Provides a means of running data migrations. 
 */
export default class MigratorInitiator {
  /**
   * Returns a sorted array of migrators that are eligible to be run. 
   * 
   * If two migrators target the same version, the migrator which results in the higher migrated version is preferred. 
   * 
   * @throws {Error} Thrown, if two given migrators have the exact same target and migrated version numbers. 
   * This indicates a duplicate entry in the list and is to be seen as an error, since only one of the two migrators will ever be run, 
   * even though both might be meant to run! 
   * 
   * @example
   * ```JS
   * targeted version -> migrated version
   * 0.9.0 -> 1.0.0
   * 1.0.0 -> 1.2.0
   * 1.0.0 -> 1.1.0
   * 1.1.0 -> 1.2.0
   * 1.2.0 -> 2.0.0
   * 2.0.0 -> 2.0.1
   * ```
   * @returns {Array<AbstractMigrator>}
   * @readonly
   * @private
   */
  _getMigrators() {
    return MIGRATORS.sort((a, b) => {
      // Compare target version. 
      // Smaller versions result in -1, meaning they appear earlier in the list. 
      // This way, lower target version numbers are preferred over higher ones. 
      if (a.targetVersion.major > b.targetVersion.major) {
        return 1;
      } else if (a.targetVersion.major < b.targetVersion.major) {
        return -1;
      }

      if (a.targetVersion.minor > b.targetVersion.minor) {
        return 1;
      } else if (a.targetVersion.minor < b.targetVersion.minor) {
        return -1;
      }

      if (a.targetVersion.patch > b.targetVersion.patch) {
        return 1;
      } else if (a.targetVersion.patch < b.targetVersion.patch) {
        return -1;
      }

      // Compare migrated version. 
      // Smaller versions result in 1, meaning they appear later in the list. 
      // This way, higher migrated version numbers are preferred over lower ones. 
      if (a.migratedVersion.major > b.migratedVersion.major) {
        return -1;
      } else if (a.migratedVersion.major < b.migratedVersion.major) {
        return 1;
      }

      if (a.migratedVersion.minor > b.migratedVersion.minor) {
        return -1;
      } else if (a.migratedVersion.minor < b.migratedVersion.minor) {
        return 1;
      }

      if (a.migratedVersion.patch > b.migratedVersion.patch) {
        return -1;
      } else if (a.migratedVersion.patch < b.migratedVersion.patch) {
        return 1;
      }

      throw new Error("Migrator duplication detected");
    });
  };

  /**
   * Runs through all migrators, one by one, and sequentally executes their migration function, 
   * if applicable. 
   * @async
   * @throws {Error} Any error that occurs during processing. 
   */
  async migrateAsPossible() {
    const migrators = this._getMigrators();
    for (const migrator of migrators) {
      if (migrator.isApplicable()) {
        await migrator.migrate();
      }
    }
  }

  /**
   * Returns a boolean value indicating whether any migration is currently possible/necessary. 
   * @returns {Boolean}
   */
  isApplicable() {
    const migrators = this._getMigrators();
    for (const migrator of migrators) {
      if (migrator.isApplicable() === true) {
        return true;
      }
    }
    return false;
  }

  /**
   * Returns the highest migratable version. 
   * 
   * This _should_ be the same as the system version, but it doesn't, technically, have to. 
   * @type {VersionCode}
   * @readonly
   */
  get finalMigrationVersion() {
    let highestVersion = new VersionCode(0, 0, 0);
    const migrators = this._getMigrators();
    for (const migrator of migrators) {
      if (migrator.migratedVersion.major > highestVersion.major
        || migrator.migratedVersion.minor > highestVersion.minor
        || migrator.migratedVersion.patch > highestVersion.patch) {
          highestVersion = migrator.migratedVersion;
      }
    }
    return highestVersion;
  }
}
