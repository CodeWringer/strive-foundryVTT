import AbstractMigrator from "../abstract-migrator.mjs";
import VersionCode from "../version-code.mjs";

/**
 * Migrates data from version 0.3.1 to 1.0.0. 
 */
export default class Migrator_0_3_1__1_0_0 extends AbstractMigrator {
  /** @override */
  get targetVersion() { return new VersionCode(0, 3, 1) };

  /** @override */
  get migratedVersion() { return new VersionCode(1, 0, 0) };

  /** @override */
  async _doWork() {
    return new Promise(async (resolve, reject) => {

      // Do nothing.

      resolve();
    });
  }
}