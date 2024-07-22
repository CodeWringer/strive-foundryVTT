import AbstractMigrator from "../abstract-migrator.mjs";
import VersionCode from "../version-code.mjs";

/**
 * Migrates data from version 0.3.0 to 1.2.2. 
 * 
 * This migrator doesn't actually do anything. It serves as a reference for actual 
 * migrators in the future. 
 */
export default class Migrator_0_3_0__1_2_2 extends AbstractMigrator {
  /** @override */
  get targetVersion() { return new VersionCode(0, 3, 0) };

  /** @override */
  get migratedVersion() { return new VersionCode(1, 2, 2) };

  /** @override */
  async _doWork() {
  }
}
