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
    await this._replaceFighting();
    await this._updateSkills();
    await this._updateItems();
  }
  
  /**
   * @private
   */
  async _updateSkills() {
    // Get all "skill" containing system compendia. 
    const packs = [
      game.packs.get("strive.skills"),
    ];

    // Get all editable actors from world and compendia. 
    const actors = await new DocumentFetcher().findAll({
      documentType: "Actor",
      includeLocked: false,
    });

    // Prepare a map of the property names for the property values to keep. 
    const propertiesToKeep = new Map();
    propertiesToKeep.set("value", "value");
    propertiesToKeep.set("successes", "successes");
    propertiesToKeep.set("failures", "failures");

    // Do the replacement for every actor. 
    for (const actor of actors) {
      await this.replaceMatchingDocumentsWithPackData(actor, "skill", packs, propertiesToKeep);
    }
  }

  /**
   * @private
   */
  async _updateItems() {
    // Get all "item" containing system compendia. 
    const packs = [
      game.packs.get("strive.armors"),
      game.packs.get("strive.shields"),
      game.packs.get("strive.supplies-and-stuff"),
      game.packs.get("strive.valuables"),
      game.packs.get("strive.weapons"),
    ];

    // Get all editable actors from world and compendia. 
    const actors = await await new DocumentFetcher().findAll({
      documentType: "Actor",
      includeLocked: false,
    });

    // Prepare a map of the property names for the property values to keep. 
    const propertiesToKeep = new Map();
    propertiesToKeep.set("quantity", "quantity");

    // Do the replacement for every actor. 
    for (const actor of actors) {
      await this.replaceMatchingDocumentsWithPackData(actor, "item", packs, propertiesToKeep);
    }
  }

  /**
   * @private
   */
  async _replaceFighting() {
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
      includeLocked: false,
    });

    // Names of the properties to keep at their current values. 
    const propertiesToKeep = new Map();
    propertiesToKeep.set("value", "value");
    propertiesToKeep.set("successes", "successes");
    propertiesToKeep.set("failures", "failures");

    // Replace...
    for (const actor of actors) {
      const fightingSkill = actor.items.filter(it => 
        it.type === "skill" 
        && it.name === "Fighting" 
        && (it.system ?? it.data.data).isCustom === false
      )[0];

      if (fightingSkill === undefined) {
        continue;
      }

      this.replaceDocumentData(fightingSkill, tacticsSkillDefinition, propertiesToKeep);
    }
  }
}

MIGRATORS.push(new Migrator_1_2_2__1_3_0());
