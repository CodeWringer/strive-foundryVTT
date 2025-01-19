import AbstractMigrator from "../abstract-migrator.mjs";
import VersionCode from "../version-code.mjs";

export default class Migrator_1_7_4__1_7_5 extends AbstractMigrator {
  /** @override */
  get targetVersion() { return new VersionCode(1, 7, 4) };

  /** @override */
  get migratedVersion() { return new VersionCode(1, 7, 5) };

  /** @override */
  async _doWork() {
    // No work.
  }
}
