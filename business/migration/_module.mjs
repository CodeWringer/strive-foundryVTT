import AbstractMigrator from "./abstract-migrator.mjs";
import EmptyMigrator from "./empty-migrator.mjs";
import MigratorInitiator from "./migrator-initiator.mjs";
import Migrator_1_16_1__1_16_2 from "./migrators/migrator_1-16-1_1-16-2.mjs";
import Migrator_1_16_2__2_0_0 from "./migrators/migrator_1-16-2_2-0-0.mjs";
import VersionCode from "./version-code.mjs";
import { WorldSystemVersion } from "./world-system-version.mjs";
import { MIGRATORS } from "./migrators.mjs";

export {
  AbstractMigrator,
  EmptyMigrator,
  MigratorInitiator,
  VersionCode,
  WorldSystemVersion,
  Migrator_1_16_1__1_16_2,
  Migrator_1_16_2__2_0_0,
  MIGRATORS,
};

/**
 * Wraps the `business.migration` module.
 */
export const migration = {
  AbstractMigrator: AbstractMigrator,
  EmptyMigrator: EmptyMigrator,
  MigratorInitiator: MigratorInitiator,
  VersionCode: VersionCode,
  WorldSystemVersion: WorldSystemVersion,
  migrators: {
    Migrator_1_16_1__1_16_2: Migrator_1_16_1__1_16_2,
    Migrator_1_16_2__2_0_0: Migrator_1_16_2__2_0_0,
  },
  MIGRATORS: MIGRATORS,
  init: () => {
    MIGRATORS.init();
  },
};
