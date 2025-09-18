import { DOCUMENT_COLLECTION_SOURCES } from "../../document/document-fetcher/document-collection-source.mjs";
import DocumentFetcher from "../../document/document-fetcher/document-fetcher.mjs";
import DocumentUpdater from "../../document/document-updater/document-updater.mjs";
import { GENERAL_DOCUMENT_TYPES } from "../../document/general-document-types.mjs";
import { PropertyUtil } from "../../util/property-utility.mjs";
import AbstractMigrator from "../abstract-migrator.mjs";
import VersionCode from "../version-code.mjs";

export default class Migrator_1_13_0__1_14_0 extends AbstractMigrator {
  /** @override */
  get fromVersion() { return new VersionCode(1, 13, 0) };

  /** @override */
  get toVersion() { return new VersionCode(1, 14, 0) };

  /** @override */
  async _doWork() {
    // Get all editable PCs.
    const actors = await new DocumentFetcher().findAll({
      documentType: GENERAL_DOCUMENT_TYPES.ACTOR,
      source: DOCUMENT_COLLECTION_SOURCES.all,
      includeLocked: false,
    });
    const transientActors = actors.map(it => it.getTransientObject());

    const updater = new DocumentUpdater({
      propertyUtility: PropertyUtil,
      logger: game.strive.logger,
    });

    for await (const actor of transientActors) {
      if ((actor.advancement ?? {}).advancementEnabled) {
        // Convert attribute progress to XP. 
        let xp = 0;
        for await (const attribute of actor.attributes) {
          const rawAttribute = actor.document.system.attributes[attribute.name];
          xp += ((rawAttribute ?? {}).progress ?? 0);
          await updater.deleteByPath(actor.document, `system.attributes.${attribute.name}.progress`);
        }
        await updater.updateByPath(actor.document, "system.advancement.xp", xp);
        
        // Get all skills and convert successes and failures to plain progress. 
        const skills = actor.skills.all;
        for await (const skill of skills) {
          const progress = (skill.document.system.successes ?? 0) + (skill.document.system.failures ?? 0);
          await updater.deleteByPath(skill.document, "system.successes");
          await updater.deleteByPath(skill.document, "system.failures");
          await updater.updateByPath(skill.document, "system.advancementProgress", progress);
        }
      }
    }
  }
}
