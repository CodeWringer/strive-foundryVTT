import AbstractMigrator from "../abstract-migrator.mjs";
import { MIGRATORS } from "../migrators.mjs";
import VersionCode from "../version-code.mjs";

export default class Migrator_1_5_10__1_5_11 extends AbstractMigrator {
  /** @override */
  get targetVersion() { return new VersionCode(1, 5, 10) };

  /** @override */
  get migratedVersion() { return new VersionCode(1, 5, 11) };

  /** @override */
  async _doWork() {
    // No work.
  }
}

MIGRATORS.push(new Migrator_1_5_10__1_5_11());
