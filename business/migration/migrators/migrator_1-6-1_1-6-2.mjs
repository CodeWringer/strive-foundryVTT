import AbstractMigrator from "../abstract-migrator.mjs";
import VersionCode from "../version-code.mjs";

export default class Migrator_1_6_1__1_6_2 extends AbstractMigrator {
  /** @override */
  get targetVersion() { return new VersionCode(1, 6, 1) };

  /** @override */
  get migratedVersion() { return new VersionCode(1, 6, 2) };

  /** @override */
  async _doWork() {
    // Do nothing.
  }
}
