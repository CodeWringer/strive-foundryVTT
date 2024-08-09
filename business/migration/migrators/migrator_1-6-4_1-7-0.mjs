import AbstractMigrator from "../abstract-migrator.mjs";
import VersionCode from "../version-code.mjs";

export default class Migrator_1_6_4__1_7_0 extends AbstractMigrator {
  /** @override */
  get targetVersion() { return new VersionCode(1, 6, 4) };

  /** @override */
  get migratedVersion() { return new VersionCode(1, 7, 0) };

  /** @override */
  async _doWork() {
    // No work.
  }
}
