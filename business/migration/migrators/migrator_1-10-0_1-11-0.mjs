import AbstractMigrator from "../abstract-migrator.mjs";
import VersionCode from "../version-code.mjs";

export default class Migrator_1_10_0__1_11_0 extends AbstractMigrator {
  /** @override */
  get targetVersion() { return new VersionCode(1, 10, 0) };

  /** @override */
  get migratedVersion() { return new VersionCode(1, 11, 0) };

  /** @override */
  async _doWork() {
    // No work.
  }
}
