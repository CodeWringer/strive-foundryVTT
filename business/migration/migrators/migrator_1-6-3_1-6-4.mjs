import AbstractMigrator from "../abstract-migrator.mjs";
import VersionCode from "../version-code.mjs";

export default class Migrator_1_6_3__1_6_4 extends AbstractMigrator {
  /** @override */
  get targetVersion() { return new VersionCode(1, 6, 3) };

  /** @override */
  get migratedVersion() { return new VersionCode(1, 6, 4) };

  /** @override */
  async _doWork() {
    // No work.
  }
}
