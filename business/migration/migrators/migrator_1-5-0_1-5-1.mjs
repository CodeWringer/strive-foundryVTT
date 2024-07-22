import AbstractMigrator from "../abstract-migrator.mjs";
import VersionCode from "../version-code.mjs";

export default class Migrator_1_5_0__1_5_1 extends AbstractMigrator {
  /** @override */
  get targetVersion() { return new VersionCode(1, 5, 0) };

  /** @override */
  get migratedVersion() { return new VersionCode(1, 5, 1) };

  /** @override */
  async _doWork() {
    // Nothing yet.
  }
}
