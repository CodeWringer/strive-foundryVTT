import { Migrator_1_16_1__1_16_2, Migrator_1_16_2__2_0_0 } from './_module.mjs';

/**
 * Defines the list of system migrators. 
 * 
 * @constant
 * @readonly
 */
export const MIGRATORS = {
  list: [],
  init: () => {
    MIGRATORS.list.push(new Migrator_1_16_1__1_16_2());
    MIGRATORS.list.push(new Migrator_1_16_2__2_0_0());
  },
};
