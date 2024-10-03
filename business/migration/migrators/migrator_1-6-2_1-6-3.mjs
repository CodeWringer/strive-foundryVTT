import DocumentFetcher from "../../document/document-fetcher/document-fetcher.mjs";
import DocumentUpdater from "../../document/document-updater/document-updater.mjs";
import { PropertyUtil } from "../../util/property-utility.mjs";
import AbstractMigrator from "../abstract-migrator.mjs";
import VersionCode from "../version-code.mjs";

export default class Migrator_1_6_2__1_6_3 extends AbstractMigrator {
  /** @override */
  get targetVersion() { return new VersionCode(1, 6, 2) };

  /** @override */
  get migratedVersion() { return new VersionCode(1, 6, 3) };

  /** @override */
  async _doWork() {
    // Remove old attributes. 
    const docFetcher = new DocumentFetcher();
    const editableActors = await docFetcher.findAll({
      documentType: "Actor",
      searchEmbedded: true,
      includeLocked: false,
    });

    const docUpdater = new DocumentUpdater({
      propertyUtility: PropertyUtil,
      logger: game.strive.logger,
    })

    for (const actor of editableActors) {
      await docUpdater.deleteByPath(actor, "system.attributes.physical");
      await docUpdater.deleteByPath(actor, "system.attributes.mental");
      await docUpdater.deleteByPath(actor, "system.attributes.social");
    }
  }
}
