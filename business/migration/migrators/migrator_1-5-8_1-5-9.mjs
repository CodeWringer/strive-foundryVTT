import AbstractMigrator from "../abstract-migrator.mjs";
import VersionCode from "../version-code.mjs";

export default class Migrator_1_5_8__1_5_9 extends AbstractMigrator {
  /** @override */
  get targetVersion() { return new VersionCode(1, 5, 8) };

  /** @override */
  get migratedVersion() { return new VersionCode(1, 5, 9) };

  /** @override */
  async _doWork() {
    // No work.
  }
}
