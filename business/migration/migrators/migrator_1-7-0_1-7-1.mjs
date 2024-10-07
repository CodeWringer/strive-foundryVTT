import DocumentFetcher from "../../document/document-fetcher/document-fetcher.mjs";
import DocumentUpdater from "../../document/document-updater/document-updater.mjs";
import { ITEM_TYPES } from "../../document/item/item-types.mjs";
import { PropertyUtil } from "../../util/property-utility.mjs";
import AbstractMigrator from "../abstract-migrator.mjs";
import VersionCode from "../version-code.mjs";

export default class Migrator_1_7_0__1_7_1 extends AbstractMigrator {
  /** @override */
  get targetVersion() { return new VersionCode(1, 7, 0) };

  /** @override */
  get migratedVersion() { return new VersionCode(1, 7, 1) };

  /** @override */
  async _doWork() {
    const docUpdater = new DocumentUpdater({
      propertyUtility: PropertyUtil,
      logger: game.strive.logger,
    });

    const docFetcher = new DocumentFetcher();

    // remove skill category 
    const editableSkills = await docFetcher.findAll({
      documentType: "Item",
      contentType: ITEM_TYPES.SKILL,
      searchEmbedded: true,
      includeLocked: false,
    });
    for (const skill of editableSkills) {
      await docUpdater.deleteByPath(skill, "system.category");
    }

    // remove asset isOnPerson 
    const editableAssets = await docFetcher.findAll({
      documentType: "Item",
      contentType: ITEM_TYPES.ASSET,
      searchEmbedded: true,
      includeLocked: false,
    });
    for (const asset of editableAssets) {
      await docUpdater.deleteByPath(asset, "system.isOnPerson");
    }
  }
}
