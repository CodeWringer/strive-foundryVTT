import AbstractMigrator from "../abstract-migrator.mjs";
import { MIGRATORS } from "../migrators.mjs";
import VersionCode from "../version-code.mjs";

export default class Migrator_1_5_3__1_5_4 extends AbstractMigrator {
  /** @override */
  get targetVersion() { return new VersionCode(1, 5, 3) };

  /** @override */
  get migratedVersion() { return new VersionCode(1, 5, 4) };

  /** @override */
  async _doWork() {
    // No work to do.
  }
}

MIGRATORS.push(new Migrator_1_5_3__1_5_4());
