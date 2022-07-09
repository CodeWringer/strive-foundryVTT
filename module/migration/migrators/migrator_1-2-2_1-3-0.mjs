import { findItem, getActors } from "../../utils/content-utility.mjs";
import AbstractMigrator from "../abstract-migrator.mjs";
import VersionCode from "../version-code.mjs";

export default class Migrator_1_2_2__1_3_0 extends AbstractMigrator {
  /** @override */
  get targetVersion() { return new VersionCode(1, 2, 2) };

  /** @override */
  get migratedVersion() { return new VersionCode(1, 3, 0) };

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

    // Replace...
    for (const actor of actors) {
      const fightingSkill = actor.items.filter(it => it.type === "skill" && it.name === "Fighting" && it.data.data.isCustom === false)[0];

      if (fightingSkill === undefined)
        continue;

      this.replaceSkillData(actor, fightingSkill, tacticsSkillDefinition);
    }
  }
}