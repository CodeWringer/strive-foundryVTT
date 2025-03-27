import AbstractMigrator from "../abstract-migrator.mjs";
import VersionCode from "../version-code.mjs";

export default class Migrator_1_7_5__1_7_6 extends AbstractMigrator {
  /** @override */
  get targetVersion() { return new VersionCode(1, 7, 5) };

  /** @override */
  get migratedVersion() { return new VersionCode(1, 7, 6) };

  /** @override */
  async _doWork() {
    // No work.
  }
}
