import AbstractMigrator from "../abstract-migrator.mjs";
import VersionCode from "../version-code.mjs";

export default class Migrator_1_5_11__1_5_12 extends AbstractMigrator {
  /** @override */
  get targetVersion() { return new VersionCode(1, 5, 11) };

  /** @override */
  get migratedVersion() { return new VersionCode(1, 5, 12) };

  /** @override */
  async _doWork() {
    // No work.
  }
}
