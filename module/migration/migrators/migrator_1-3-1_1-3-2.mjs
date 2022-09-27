import AbstractMigrator from "../abstract-migrator.mjs";
import VersionCode from "../version-code.mjs";

export default class Migrator_1_3_1__1_3_2 extends AbstractMigrator {
  /** @override */
  get targetVersion() { return new VersionCode(1, 3, 1) };

  /** @override */
  get migratedVersion() { return new VersionCode(1, 3, 2) };

  /** @override */
  async _doWork() {
    // Nothing yet.
  }
}