import AbstractMigrator from "../abstract-migrator.mjs";
import VersionCode from "../version-code.mjs";

export default class Migrator_1_5_6__1_5_7 extends AbstractMigrator {
  /** @override */
  get targetVersion() { return new VersionCode(1, 5, 6) };

  /** @override */
  get migratedVersion() { return new VersionCode(1, 5, 7) };

  /** @override */
  async _doWork() {
    // Maintenance release. No migrations needed. 
  }
}
