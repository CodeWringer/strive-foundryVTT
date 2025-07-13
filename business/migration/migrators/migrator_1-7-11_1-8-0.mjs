import AbstractMigrator from "../abstract-migrator.mjs";
import VersionCode from "../version-code.mjs";

export default class Migrator_1_7_11__1_8_0 extends AbstractMigrator {
  /** @override */
  get targetVersion() { return new VersionCode(1, 7, 1) };

  /** @override */
  get migratedVersion() { return new VersionCode(1, 8, 0) };

  /** @override */
  async _doWork() {
    // No work.
  }
}
