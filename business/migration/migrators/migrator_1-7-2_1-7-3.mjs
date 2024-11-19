import DocumentFetcher from "../../document/document-fetcher/document-fetcher.mjs";
import DocumentUpdater from "../../document/document-updater/document-updater.mjs";
import { GENERAL_DOCUMENT_TYPES } from "../../document/general-document-types.mjs";
import { PropertyUtil } from "../../util/property-utility.mjs";
import AbstractMigrator from "../abstract-migrator.mjs";
import VersionCode from "../version-code.mjs";

export default class Migrator_1_7_2__1_7_3 extends AbstractMigrator {
  /** @override */
  get targetVersion() { return new VersionCode(1, 7, 2) };

  /** @override */
  get migratedVersion() { return new VersionCode(1, 7, 3) };

  /** @override */
  async _doWork() {
    const docUpdater = new DocumentUpdater({
      propertyUtility: PropertyUtil,
      logger: game.strive.logger,
    });

    const docFetcher = new DocumentFetcher();

    // Fix up character template data.
    const actors = docFetcher.findAll({
      documentType: GENERAL_DOCUMENT_TYPES.ACTOR,
    });
  }
}
