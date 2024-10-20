import AbstractMigrator from "../abstract-migrator.mjs";
import VersionCode from "../version-code.mjs";

export default class Migrator_1_7_1__1_7_2 extends AbstractMigrator {
  /** @override */
  get targetVersion() { return new VersionCode(1, 7, 1) };

  /** @override */
  get migratedVersion() { return new VersionCode(1, 7, 2) };

  /** @override */
  async _doWork() {
    // No work.
  }
}
