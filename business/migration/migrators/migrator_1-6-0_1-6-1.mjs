import AbstractMigrator from "../abstract-migrator.mjs";
import VersionCode from "../version-code.mjs";

export default class Migrator_1_6_0__1_6_1 extends AbstractMigrator {
  /** @override */
  get targetVersion() { return new VersionCode(1, 6, 0) };

  /** @override */
  get migratedVersion() { return new VersionCode(1, 6, 1) };

  /** @override */
  async _doWork() {
    // Do nothing.
  }
}
