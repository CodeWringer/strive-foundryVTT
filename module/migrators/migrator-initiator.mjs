import { Migrator_0_2_0__0_2_0 } from './migrator_0-2-0_0-2-0.mjs';

/**
 * Runs through all migrators, one by one, and executes their migration function, 
 * if they're applicable. 
 */
export async function migrateAsPossible() {
  const migrators = [
    new Migrator_0_2_0__0_2_0()
  ];

  for (const migrator of migrators) {
    if (migrator.isApplicable()) {
      await migrator.migrate();
    }
  }
}