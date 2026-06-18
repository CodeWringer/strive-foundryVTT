import Migrator_1_16_1__1_16_2 from './migrators/migrator_1-16-1_1-16-2.mjs';

/**
 * Defines the list of system migrators. 
 * 
 * @type {Array<AbstractMigrator>}
 * @readonly
 */
export const MIGRATORS = [
  new Migrator_1_16_1__1_16_2(),
];
