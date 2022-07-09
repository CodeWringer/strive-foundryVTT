import AbstractMigrator from "../abstract-migrator.mjs";
import VersionCode from "../version-code.mjs";

export default class Migrator_1_1_0__1_2_2 extends AbstractMigrator {
  /** @override */
  get targetVersion() { return new VersionCode(1, 1, 0) };

  /** @override */
  get migratedVersion() { return new VersionCode(1, 2, 2) };

  /** @override */
  async _doWork() {
  }
}