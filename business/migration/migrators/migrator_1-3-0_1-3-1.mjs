import { findItem, getActors } from "../../util/content-utility.mjs";
import AbstractMigrator from "../abstract-migrator.mjs";
import { MIGRATORS } from "../migrators.mjs";
import VersionCode from "../version-code.mjs";

export default class Migrator_1_3_0__1_3_1 extends AbstractMigrator {
  /** @override */
  get targetVersion() { return new VersionCode(1, 3, 0) };

  /** @override */
  get migratedVersion() { return new VersionCode(1, 3, 1) };

  /** @override */
  async _doWork() {
    await this.replaceFighting();
    await this.updateSkills();
    await this.updateItems();
  }

  async replaceFighting() {
    // Get "tactics" definition from system compendium. 
    const tacticsSkillDefinition = await findItem({ name: "Tactics", pack: "ambersteel.skills" });

    // Get all actors from world and compendia. 
    const actors = await getActors({ world: true, worldCompendia: true });

    // Names of the properties to keep at their current values. 
    const propertiesToKeep = new Map();
    propertiesToKeep.set("value", "value");
    propertiesToKeep.set("successes", "successes");
    propertiesToKeep.set("failures", "failures");

    // Replace...
    for (const actor of actors) {
      const fightingSkill = actor.items.filter(it => it.type === "skill" && it.name === "Fighting" && it.data.data.isCustom === false)[0];

      if (fightingSkill === undefined) {
        continue;
      }

      this.replaceDocumentData(fightingSkill, tacticsSkillDefinition, propertiesToKeep);
    }
  }
}

MIGRATORS.push(new Migrator_1_3_0__1_3_1());
