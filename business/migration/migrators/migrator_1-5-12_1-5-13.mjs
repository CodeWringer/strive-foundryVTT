import AbstractMigrator from "../abstract-migrator.mjs";
import VersionCode from "../version-code.mjs";

export default class Migrator_1_5_12__1_5_13 extends AbstractMigrator {
  /** @override */
  get targetVersion() { return new VersionCode(1, 5, 12) };

  /** @override */
  get migratedVersion() { return new VersionCode(1, 5, 13) };

  /** @override */
  async _doWork() {
    // No work.
  }
}
