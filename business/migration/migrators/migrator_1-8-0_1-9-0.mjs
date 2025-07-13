import AbstractMigrator from "../abstract-migrator.mjs";
import VersionCode from "../version-code.mjs";

export default class Migrator_1_8_0__1_9_0 extends AbstractMigrator {
  /** @override */
  get targetVersion() { return new VersionCode(1, 8, 0) };

  /** @override */
  get migratedVersion() { return new VersionCode(1, 9, 0) };

  /** @override */
  async _doWork() {
    // No work.
  }
}
