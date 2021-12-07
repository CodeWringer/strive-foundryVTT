import AbstractMigrator from "./abstract-migrator.mjs";

/**
 * Migrates data from version 0.2.0 to 0.2.0. 
 */
export class Migrator_0_2_0__0_2_0 extends AbstractMigrator {
  /**
   * Returns true, if this migrator can be applied to the currently installed version of the system. 
   * @returns {Boolean} True, if this migrator can be applied to the currently installed version of the system. 
   * @override
   */
  isApplicable() {
    const version = super.getCurrentVersion();
    if (version.major === 0 && version.minor === 2) {
      return true;
    }
    return false;
  }

  /**
   * Begins the migration process. 
   * @async
   * @override
   */
  async migrate() {
    return new Promise(async (resolve, reject) => {

      // TODO
      resolve();
    });
  }
}