import AbstractMigrator from "./abstract-migrator.mjs";
import EmptyMigrator from "./empty-migrator.mjs";
import MigratorInitiator from "./migrator-initiator.mjs";
import { MIGRATORS } from "./migrators.mjs";
import Migrator_1_16_1__1_16_2 from "./migrators/migrator_1-16-1_1-16-2.mjs";
import VersionCode from "./version-code.mjs";
import { WorldSystemVersion } from "./world-system-version.mjs";

export {
  AbstractMigrator,
  EmptyMigrator,
  MigratorInitiator,
  MIGRATORS,
  VersionCode,
  WorldSystemVersion,
  Migrator_1_16_1__1_16_2,
};

/**
 * Wraps the `business.migration` module.
 */
export const migration = {
  AbstractMigrator: AbstractMigrator,
  EmptyMigrator: EmptyMigrator,
  MigratorInitiator: MigratorInitiator,
  MIGRATORS: MIGRATORS,
  VersionCode: VersionCode,
  WorldSystemVersion: WorldSystemVersion,
  migrators: {
    Migrator_1_16_1__1_16_2: Migrator_1_16_1__1_16_2,
  },
};
