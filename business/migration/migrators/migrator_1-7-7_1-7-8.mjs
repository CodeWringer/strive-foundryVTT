import AbstractMigrator from "../abstract-migrator.mjs";
import VersionCode from "../version-code.mjs";

export default class Migrator_1_7_7__1_7_8 extends AbstractMigrator {
  /** @override */
  get targetVersion() { return new VersionCode(1, 7, 7) };

  /** @override */
  get migratedVersion() { return new VersionCode(1, 7, 8) };

  /** @override */
  async _doWork() {
    // No work.
  }
}
