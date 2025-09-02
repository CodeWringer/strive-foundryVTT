import AbstractMigrator from "../abstract-migrator.mjs";
import VersionCode from "../version-code.mjs";

export default class Migrator_1_12_0__1_13_0 extends AbstractMigrator {
  /** @override */
  get targetVersion() { return new VersionCode(1, 12, 0) };

  /** @override */
  get migratedVersion() { return new VersionCode(1, 13, 0) };

  /** @override */
  async _doWork() {
    // No work. 
  }
}
