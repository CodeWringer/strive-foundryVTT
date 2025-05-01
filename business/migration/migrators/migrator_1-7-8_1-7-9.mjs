import AbstractMigrator from "../abstract-migrator.mjs";
import VersionCode from "../version-code.mjs";

export default class Migrator_1_7_8__1_7_9 extends AbstractMigrator {
  /** @override */
  get targetVersion() { return new VersionCode(1, 7, 8) };

  /** @override */
  get migratedVersion() { return new VersionCode(1, 7, 9) };

  /** @override */
  async _doWork() {
    // No work.
  }
}
