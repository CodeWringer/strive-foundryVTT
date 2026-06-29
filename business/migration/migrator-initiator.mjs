import AbstractMigrator from './abstract-migrator.mjs';
import EmptyMigrator from './empty-migrator.mjs';
import { MIGRATORS } from './migrators.mjs';
import VersionCode from './version-code.mjs';

/**
 * Provides a means of running data migrations. 
 */
export default class MigratorInitiator {
  /**
   * Runs through all migrators, one by one, and sequentally executes their migration function, 
   * if applicable. 
   * 
   * @param {Object} args
   * @param {Function | undefined} args.onBegin Invoked when the work begins. Arguments:
   * * `totalProgress: Number`
   * * `localizedTitle: String` - A brief localized description of the kind of work that will be done. 
   * @param {Function | undefined} args.onBeginIncrement Invoked when an increment of the work is begun. Arguments:
   * * `totalProgress: Number`
   * * `progress: Number`
   * * `localizedTitle: String` - A brief localized description of the current work increment. 
   * @param {Function | undefined} args.onCompleteIncrement Invoked when an increment of the work is completed. Arguments:
   * * `totalProgress: Number`
   * * `progress: Number`
   * * `localizedTitle: String` - A brief localized description of the current work increment. 
   * @param {Function | undefined} args.onComplete Invoked when work is completed. 
   * 
   * @throws {Error} Any error that occurs during processing. 
   * 
   * @async
   */
  async migrateAsPossible(args = {}) {
    const safeArgs = {
      onBegin: args.onBegin ?? (() => {}),
      onBeginIncrement: args.onBeginIncrement ?? (() => {}),
      onCompleteIncrement: args.onCompleteIncrement ?? (() => {}),
      onComplete: args.onComplete ?? (() => {}),
    };
    const migrators = this._getMigrators();
    for (const migrator of migrators) {
      if (migrator.isApplicable()) {
        await migrator.migrate(safeArgs);
      }
    }
  }

  /**
   * Returns a boolean value indicating whether any migration is currently possible/necessary. 
   * @returns {Boolean}
   */
  isApplicable() {
    const migrators = this._getMigrators();
    for (const migrator of migrators) {
      if (migrator.isApplicable()) {
        return true;
      }
    }
    return false;
  }

  /**
   * Returns the highest migratable version. 
   * 
   * This will _always_ be at least the system's version, as it is defined in the 
   * system.json file. However, a migrator _could_ migrate to a higher version 
   * than the system's. 
   * 
   * @type {VersionCode}
   * @readonly
   */
  get finalMigrationVersion() {
    let highestToVersion = new VersionCode(0, 0, 0);
    const migrators = this._getMigrators();
    for (const migrator of migrators) {
      if (migrator.toVersion.greater(highestToVersion)) {
        highestToVersion = migrator.toVersion;
      }
    }
    return highestToVersion;
  }

  /**
   * Returns a sorted array of migrators that are eligible to be run. 
   * 
   * If two migrators target the same version, the migrator which results in the higher migrated version is preferred. 
   * 
   * @example
   * ```JS
   * targeted version -> migrated version
   * 0.9.0 -> 1.0.0
   * 1.0.0 -> 1.2.0
   * 1.0.0 -> 1.1.0
   * 1.1.0 -> 1.2.0
   * 1.2.0 -> 2.0.0
   * 2.0.0 -> 2.0.1
   * ```
   * @returns {Array<AbstractMigrator>}
   * 
   * @throws {Error} Thrown, if two given migrators have the exact same target and migrated version numbers. 
   * This indicates a duplicate entry in the list and is to be seen as an error, since only one of the two migrators will ever be run, 
   * even though both might be meant to run! 
   * 
   * @readonly
   * @private
   */
  _getMigrators() {
    const migrators = MIGRATORS.list.sort((a, b) => {
      // Compare target version. 
      // Smaller versions result in -1, meaning they appear earlier in the list. 
      // This way, lower "from" version numbers are preferred over higher ones. 
      if (a.fromVersion.major > b.fromVersion.major) {
        return 1;
      } else if (a.fromVersion.major < b.fromVersion.major) {
        return -1;
      }

      if (a.fromVersion.minor > b.fromVersion.minor) {
        return 1;
      } else if (a.fromVersion.minor < b.fromVersion.minor) {
        return -1;
      }

      if (a.fromVersion.patch > b.fromVersion.patch) {
        return 1;
      } else if (a.fromVersion.patch < b.fromVersion.patch) {
        return -1;
      }

      // Compare migrated version. 
      // Smaller versions result in 1, meaning they appear later in the list. 
      // This way, higher "to" version numbers are preferred over lower ones. 
      if (a.toVersion.major > b.toVersion.major) {
        return -1;
      } else if (a.toVersion.major < b.toVersion.major) {
        return 1;
      }

      if (a.toVersion.minor > b.toVersion.minor) {
        return -1;
      } else if (a.toVersion.minor < b.toVersion.minor) {
        return 1;
      }

      if (a.toVersion.patch > b.toVersion.patch) {
        return -1;
      } else if (a.toVersion.patch < b.toVersion.patch) {
        return 1;
      }

      throw new Error("Migrator duplication detected");
    });

    return this._fillInSyntheticMigrators(migrators);
  };

  /**
   * Creates synthetic migrators for every version code jump that doesn't yet have one. 
   * 
   * @param {Array<AbstractMigrator>} migrators A ascending-sorted(!) list of migrators. 
   * 
   * @returns {Array<AbstractMigrator>}
   */
  _fillInSyntheticMigrators(migrators) {
    if (migrators.length === 0) return migrators;

    let lastMigrator = new EmptyMigrator(new VersionCode(0, 0, 0), migrators[0].fromVersion);
    const migratorsWithSynthetics = [
      lastMigrator,
    ];
    for (let i = 0; i < migrators.length; i++) {
      const migrator = migrators[i];
      if (!lastMigrator.toVersion.equals(migrator.fromVersion)) {
        migratorsWithSynthetics.push(
          new EmptyMigrator(lastMigrator.toVersion, migrator.fromVersion)
        );
      }
      migratorsWithSynthetics.push(migrator);
      lastMigrator = migrator;
    }
    const systemVersion = VersionCode.fromString(game.system.version);
    const finalMigrator = migratorsWithSynthetics[migratorsWithSynthetics.length - 1];
    if (!finalMigrator.toVersion.equals(systemVersion)) {
      migratorsWithSynthetics.push(
        new EmptyMigrator(finalMigrator.toVersion, systemVersion)
      );
    }

    return migratorsWithSynthetics;
  }
}
