import Migrator_1_2_2__1_3_0 from './migrators/migrator_1-2-2_1-3-0.mjs';
import Migrator_1_3_0__1_3_1 from './migrators/migrator_1-3-0_1-3-1.mjs';
import Migrator_1_3_2__1_4_1 from './migrators/migrator_1-3-2_1-4-1.mjs';
import Migrator_1_5_1__1_5_2 from './migrators/migrator_1-5-1_1-5-2.mjs';
import Migrator_1_5_13__1_6_0 from './migrators/migrator_1-5-13_1-6-0.mjs';
import Migrator_1_5_2__1_5_3 from './migrators/migrator_1-5-2_1-5-3.mjs';
import Migrator_1_5_4__1_5_5 from './migrators/migrator_1-5-4_1-5-5.mjs';
import Migrator_1_5_5__1_5_6 from './migrators/migrator_1-5-5_1-5-6.mjs';
import Migrator_1_6_2__1_6_3 from './migrators/migrator_1-6-2_1-6-3.mjs';
import Migrator_1_7_0__1_7_1 from './migrators/migrator_1-7-0_1-7-1.mjs';
import Migrator_1_7_2__1_7_3 from './migrators/migrator_1-7-2_1-7-3.mjs';
import Migrator_1_13_0__1_14_0 from './migrators/migrator_1-13-0_1-14-0.mjs';
import Migrator_1_16_1__1_16_2 from './migrators/migrator_1-16-1_1-16-2.mjs';

/**
 * Defines the list of system migrators. 
 * 
 * @type {Array<AbstractMigrator>}
 * @readonly
 */
export const MIGRATORS = [
  new Migrator_1_2_2__1_3_0(),
  new Migrator_1_3_0__1_3_1(),
  new Migrator_1_3_2__1_4_1(),
  new Migrator_1_5_1__1_5_2(),
  new Migrator_1_5_2__1_5_3(),
  new Migrator_1_5_4__1_5_5(),
  new Migrator_1_5_5__1_5_6(),
  new Migrator_1_5_13__1_6_0(),
  new Migrator_1_6_2__1_6_3(),
  new Migrator_1_7_0__1_7_1(),
  new Migrator_1_7_2__1_7_3(),
  new Migrator_1_13_0__1_14_0(),
  new Migrator_1_16_1__1_16_2(),
];
