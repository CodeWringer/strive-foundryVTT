import AbstractMigrator from "../abstract-migrator.mjs";
import VersionCode from "../version-code.mjs";

export default class Migrator_1_7_9__1_7_11 extends AbstractMigrator {
  /** @override */
  get targetVersion() { return new VersionCode(1, 7, 9) };

  /** @override */
  get migratedVersion() { return new VersionCode(1, 7, 11) };

  /** @override */
  async _doWork() {
    // No work.
  }
}
