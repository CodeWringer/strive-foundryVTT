import AbstractMigrator from "../abstract-migrator.mjs";
import VersionCode from "../version-code.mjs";

export default class Migrator_1_7_3__1_7_4 extends AbstractMigrator {
  /** @override */
  get targetVersion() { return new VersionCode(1, 7, 3) };

  /** @override */
  get migratedVersion() { return new VersionCode(1, 7, 4) };

  /** @override */
  async _doWork() {
    // No work.
  }
}
