import AbstractMigrator from "../abstract-migrator.mjs";
import VersionCode from "../version-code.mjs";

export default class Migrator_1_4_1__1_5_0 extends AbstractMigrator {
  /** @override */
  get targetVersion() { return new VersionCode(1, 4, 1) };

  /** @override */
  get migratedVersion() { return new VersionCode(1, 5, 0) };

  /** @override */
  async _doWork() {
    // Nothing yet.
  }
}
