import Migrator_0_3_0__0_3_1 from './migrators/migrator_0-3-0_0-3-1.mjs';
import Migrator_0_3_1__1_0_0 from './migrators/migrator_0-3-1_1-0-0.mjs';
import Migrator_1_0_0__1_1_0 from './migrators/migrator_1-0-0_1-1-0.mjs';
import Migrator_1_1_0__1_2_2 from './migrators/migrator_1-1-0_1-2-2.mjs';
import Migrator_1_2_2__1_3_0 from './migrators/migrator_1-2-2_1-3-0.mjs';
import VersionCode from './version-code.mjs';

/**
 * Provides a means of running data migrations. 
 */
export default class MigratorInitiator {
  /**
   * Returns an array of migrators that are eligible to be run. 
   * 
   * IMPORTANT: The order these migrators are defined in the list is important! The ordering must 
   * follow the order in which the versions are to be increased, or else 
   * not all migrations would run. 
   * @type {Array<AbstractMigrator>}
   * @readonly
   */
  get migrators() { return [
    new Migrator_0_3_0__0_3_1(),
    new Migrator_0_3_1__1_0_0(),
    new Migrator_1_0_0__1_1_0(),
    new Migrator_1_1_0__1_2_2(),
    new Migrator_1_2_2__1_3_0(),
  ]};

  /**
   * Runs through all migrators, one by one, and sequentally executes their migration function, 
   * if applicable. 
   * @async
   * @throws {Error} Any error that occurs during processing. 
   */
  async migrateAsPossible() {
    for (const migrator of this.migrators) {
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
    for (const migrator of this.migrators) {
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
    for (const migrator of this.migrators) {
      if (migrator.migratedVersion.major > highestVersion.major
        || migrator.migratedVersion.minor > highestVersion.minor
        || migrator.migratedVersion.patch > highestVersion.patch) {
          highestVersion = migrator.migratedVersion;
      }
    }
    return highestVersion;
  }
}
