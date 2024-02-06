import { DOCUMENT_COLLECTION_SOURCES, DocumentCollectionSource } from "../../document/document-fetcher/document-collection-source.mjs";
import DocumentFetcher from "../../document/document-fetcher/document-fetcher.mjs";
import { isDefined } from "../../util/validation-utility.mjs";
import AbstractMigrator from "../abstract-migrator.mjs";
import { MIGRATORS } from "../migrators.mjs";
import VersionCode from "../version-code.mjs";

export default class Migrator_1_5_13__1_6_0 extends AbstractMigrator {
  /** @override */
  get targetVersion() { return new VersionCode(1, 5, 13) };

  /** @override */
  get migratedVersion() { return new VersionCode(1, 6, 0) };

  /** @override */
  async _doWork() {
    // Fetch all editable skills. 
    const documentFetcher = new DocumentFetcher();
    const editableSkills = await documentFetcher.findAll({
      documentType: "Item",
      contentType: "skill",
      source: DOCUMENT_COLLECTION_SOURCES.all,
      searchEmbedded: true,
      includeLocked: false,
    });

    for (const editableSkillDocument of editableSkills) {
      await this._updateSkillAttributes(editableSkillDocument);
    }
  }

  /**
   * Migrates the "relatedAttribute" field to the new "activeBaseAttribute" and 
   * "baseAttributes" fields. 
   * 
   * @param {Document} skillDocument 
   * 
   * @private
   * @async
   */
  async _updateSkillAttributes(skillDocument) {
    const relatedAttribute = skillDocument.system.relatedAttribute;
    if (isDefined(relatedAttribute) === false) {
      await skillDocument.update({
        baseAttributes: [relatedAttribute], 
        activeBaseAttribute: relatedAttribute,
        "-=relatedAttribute": null,
      }, false);
    }
  }
}

MIGRATORS.push(new Migrator_1_5_13__1_6_0());