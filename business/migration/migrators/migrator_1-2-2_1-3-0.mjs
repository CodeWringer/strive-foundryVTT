import DocumentFetcher from "../../document/document-fetcher/document-fetcher.mjs";
import AbstractMigrator from "../abstract-migrator.mjs";
import { MIGRATORS } from "../migrators.mjs";
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
    // Get "Tactics" document from system compendium. 
    const documentFetcher = new DocumentFetcher();
    const tacticsSkillDefinition = await documentFetcher.find({
      name: "Tactics",
      documentType: "Item",
      contentType: "skill",
      source: DOCUMENT_COLLECTION_SOURCES.systemCompendia,
    });

    // Get all actors from world and compendia. 
    const actors = await documentFetcher.findAll({
      documentType: "Actor",
    });

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

MIGRATORS.push(new Migrator_1_2_2__1_3_0());
