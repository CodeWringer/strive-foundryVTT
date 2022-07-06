import { findItem, getActors, getItemDeclarations } from "../../utils/content-utility.mjs";
import AbstractMigrator from "../abstract-migrator.mjs";
import VersionCode from "../version-code.mjs";

export default class Migrator_1_2_2__1_3_0 extends AbstractMigrator {
  /** @override */
  get targetVersion() { return new VersionCode(1, 2, 2) };

  /** @override */
  get migratedVersion() { return new VersionCode(1, 3, 0) };

  /** @override */
  async _doWork() {
    return new Promise(async (resolve, reject) => {
      await this.replaceFighting();
      await this.replaceSkills();

      resolve();
    });
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

      this.replaceSkill(actor, fightingSkill, tacticsSkillDefinition);
    }
  }

  async replaceSkills() {
    // Get all skill definitions from system compendium. 
    const pack = game.packs.get("ambersteel.skills");
    
    const skillDefinitions = [];
    for (const index of pack.index) {
      const loadedSkillDocument = await pack.getDocument(index._id ?? index.id);
      skillDefinitions.push(loadedSkillDocument);
    }

    // Get all actors from world and compendia. 
    const actors = await getActors({ world: true, worldCompendia: true });

    // Replace every skill on every actor. 
    for (const actor of actors) {
      for (const skillDefinition of skillDefinitions) {
        this.updateSkill(actor, skillDefinition);
      }
    }
  }

  /**
   * Replaces any skill on the given actor that matches the given skill definition's 
   * name, with a new instance of the given skill definition. 
   * @param {Actor} actor 
   * @param {Document} skillDefinition 
   * @private
   */
  async updateSkill(actor, skillDefinition) {
    const toReplace = actor.items.filter(it => it.type === "skill" && it.name === skillDefinition.name && it.data.data.isCustom === false)[0];

    if (toReplace === undefined)
      return;

    await this.replaceSkill(actor, toReplace, skillDefinition);
  }

  /**
   * Replaces the given skill with a new instance of the given skill definition. 
   * @param {Actor} actor 
   * @param {Document} toReplace 
   * @param {Document} replaceWith 
   * @private
   */
  async replaceSkill(actor, toReplace, replaceWith) {
    const data = toReplace.data.data;
    const level = data.value;
    const successes = data.successes;
    const failures = data.failures;
    
    toReplace.delete();

    const itemData = {
      name: replaceWith.name,
      type: replaceWith.type,
      data: {
        ...replaceWith.data.data,
        value: level,
        successes: successes,
        failures: failures,
      }
    };
    Item.create(itemData, { parent: actor });
  }
}