import AbstractMigrator from "../abstract-migrator.mjs";
import { MIGRATORS } from "../migrators.mjs";
import VersionCode from "../version-code.mjs";

export default class Migrator_1_5_9__1_5_10 extends AbstractMigrator {
  /** @override */
  get targetVersion() { return new VersionCode(1, 5, 9) };

  /** @override */
  get migratedVersion() { return new VersionCode(1, 5, 10) };

  /** @override */
  async _doWork() {
    // No work.
  }
}

MIGRATORS.push(new Migrator_1_5_9__1_5_10());
