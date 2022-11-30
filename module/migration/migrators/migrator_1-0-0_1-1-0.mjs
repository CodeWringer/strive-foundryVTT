import AbstractMigrator from "../abstract-migrator.mjs";
import { MIGRATORS } from "../migrators.mjs";
import VersionCode from "../version-code.mjs";

/**
 * Migrates data from version 1.0.0 to 1.1.0. 
 */
export default class Migrator_1_0_0__1_1_0 extends AbstractMigrator {
  /** @override */
  get targetVersion() { return new VersionCode(1, 0, 0) };

  /** @override */
  get migratedVersion() { return new VersionCode(1, 1, 0) };

  /** @override */
  async _doWork() {
  }
}

MIGRATORS.push(new Migrator_1_0_0__1_1_0());
