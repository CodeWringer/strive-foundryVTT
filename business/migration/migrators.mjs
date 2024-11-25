import Migrator_0_3_0__1_2_2 from './migrators/migrator_0-3-0_0-3-1.mjs';
import Migrator_1_3_0__1_3_1 from './migrators/migrator_1-3-0_1-3-1.mjs';
import Migrator_1_3_1__1_3_2 from './migrators/migrator_1-3-1_1-3-2.mjs';
import Migrator_1_3_2__1_4_1 from './migrators/migrator_1-3-2_1-4-1.mjs';
import Migrator_1_4_1__1_5_0 from './migrators/migrator_1-4-1_1-5-0.mjs';
import Migrator_1_5_0__1_5_1 from './migrators/migrator_1-5-0_1-5-1.mjs';
import Migrator_1_5_1__1_5_2 from './migrators/migrator_1-5-1_1-5-2.mjs';
import Migrator_1_5_2__1_5_3 from './migrators/migrator_1-5-2_1-5-3.mjs';
import Migrator_1_5_3__1_5_4 from './migrators/migrator_1-5-3_1-5-4.mjs';
import Migrator_1_5_4__1_5_5 from './migrators/migrator_1-5-4_1-5-5.mjs';
import Migrator_1_5_5__1_5_6 from './migrators/migrator_1-5-5_1-5-6.mjs';
import Migrator_1_5_6__1_5_7 from './migrators/migrator_1-5-6_1-5-7.mjs';
import Migrator_1_5_7__1_5_8 from './migrators/migrator_1-5-7_1-5-8.mjs';
import Migrator_1_5_8__1_5_9 from './migrators/migrator_1-5-8_1-5-9.mjs';
import Migrator_1_5_9__1_5_10 from './migrators/migrator_1-5-9_1-5-10.mjs';
import Migrator_1_5_10__1_5_11 from './migrators/migrator_1-5-10_1-5-11.mjs';
import Migrator_1_5_11__1_5_12 from './migrators/migrator_1-5-11_1-5-12.mjs';
import Migrator_1_5_12__1_5_13 from './migrators/migrator_1-5-12_1-5-13.mjs';
import Migrator_1_5_13__1_6_0 from './migrators/migrator_1-5-13_1-6-0.mjs';
import Migrator_1_6_0__1_6_1 from "./migrators/migrator_1-6-0_1-6-1.mjs";
import Migrator_1_6_1__1_6_2 from './migrators/migrator_1-6-1_1-6-2.mjs';
import Migrator_1_6_2__1_6_3 from './migrators/migrator_1-6-2_1-6-3.mjs';
import Migrator_1_6_3__1_6_4 from './migrators/migrator_1-6-3_1-6-4.mjs';
import Migrator_1_6_4__1_7_0 from './migrators/migrator_1-6-4_1-7-0.mjs';
import Migrator_1_7_0__1_7_1 from './migrators/migrator_1-7-0_1-7-1.mjs';
import Migrator_1_7_1__1_7_2 from './migrators/migrator_1-7-1_1-7-2.mjs';
import Migrator_1_7_2__1_7_3 from './migrators/migrator_1-7-2_1-7-3.mjs';
import Migrator_1_7_3__1_7_4 from './migrators/migrator_1-7-3_1-7-4.mjs';

/**
 * Defines the list of system migrators. 
 * 
 * @type {Array<AbstractMigrator>}
 * @readonly
 */
export const MIGRATORS = [
  new Migrator_0_3_0__1_2_2(),
  new Migrator_1_3_0__1_3_1(),
  new Migrator_1_3_1__1_3_2(),
  new Migrator_1_3_2__1_4_1(),
  new Migrator_1_4_1__1_5_0(),
  new Migrator_1_5_0__1_5_1(),
  new Migrator_1_5_1__1_5_2(),
  new Migrator_1_5_2__1_5_3(),
  new Migrator_1_5_3__1_5_4(),
  new Migrator_1_5_4__1_5_5(),
  new Migrator_1_5_5__1_5_6(),
  new Migrator_1_5_6__1_5_7(),
  new Migrator_1_5_7__1_5_8(),
  new Migrator_1_5_8__1_5_9(),
  new Migrator_1_5_9__1_5_10(),
  new Migrator_1_5_10__1_5_11(),
  new Migrator_1_5_11__1_5_12(),
  new Migrator_1_5_12__1_5_13(),
  new Migrator_1_5_13__1_6_0(),
  new Migrator_1_6_0__1_6_1(),
  new Migrator_1_6_1__1_6_2(),
  new Migrator_1_6_2__1_6_3(),
  new Migrator_1_6_3__1_6_4(),
  new Migrator_1_6_4__1_7_0(),
  new Migrator_1_7_0__1_7_1(),
  new Migrator_1_7_1__1_7_2(),
  new Migrator_1_7_2__1_7_3(),
  new Migrator_1_7_3__1_7_4(),
];
