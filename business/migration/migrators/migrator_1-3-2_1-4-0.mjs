import { DOCUMENT_COLLECTION_SOURCES } from "../../document/document-fetcher/document-collection-source.mjs";
import DocumentFetcher from "../../document/document-fetcher/document-fetcher.mjs";
import { deleteByPropertyPath } from "../../document/document-update-utility.mjs";
import { updateProperty } from "../../document/document-update-utility.mjs";
import AbstractMigrator from "../abstract-migrator.mjs";
import { MIGRATORS } from "../migrators.mjs";
import VersionCode from "../version-code.mjs";

export default class Migrator_1_3_2__1_4_0 extends AbstractMigrator {
  /** @override */
  get targetVersion() { return new VersionCode(1, 3, 2) };

  /** @override */
  get migratedVersion() { return new VersionCode(1, 4, 0) };

  /** @override */
  async _doWork() {
    const documentFetcher = new DocumentFetcher();

    // Get _all_ actors. 
    const actors = await documentFetcher.findAll({
      documentType: "Actor",
      source: DOCUMENT_COLLECTION_SOURCES.all,
    });

    // These attribute groups will be migrated. 
    const attributeGroupsToMigrate = [
      {
        groupName: "physical",
        attributeNames: ["agility", "endurance", "perception", "strength", "toughness"]
      },
      {
        groupName: "mental",
        attributeNames: ["intelligence", "wisdom", "arcana"]
      },
      {
        groupName: "social",
        attributeNames: ["empathy", "oratory", "willpower"]
      },
    ];

    // Replace "value" with "level" on every attribute of every actor.
    for (const actor of actors) {
      const attributes = actor.data.data.attributes;

      for (const attributeGroupToMigrate of attributeGroupsToMigrate) {
        const attributeGroup = attributes[attributeGroupToMigrate.groupName];

        for (const attributeName of attributeGroupToMigrate.attributeNames) {
          const attribute = attributeGroup[attributeName];

          // Change in-memory data. 
          attribute.level = attribute.value;
          delete attribute.value;

          const dataPath = `data.data.attributes.${attributeGroupToMigrate.groupName}.${attributeName}`;

          // Delete property from attribute in data base. 
          await deleteByPropertyPath(actor, `${dataPath}.value`, false);
          
          // Persist level to attribute in data base. 
          await updateProperty(actor, `${dataPath}.level`, attribute.level, false);
        }
      }
    }

    // Get _all_ skills.
    const skills = await documentFetcher.findAll({
      documentType: "Item",
      contentType: "skill",
      searchEmbedded: true,
      source: DOCUMENT_COLLECTION_SOURCES.all,
    });

    // Replace "value" with "level" on every skill.
    for (const skill of skills) {
      
      // Change in-memory data. 
      skill.data.data.level = skill.data.data.value;
      delete skill.data.data.value;

      // Delete property from skill in data base. 
      await deleteByPropertyPath(skill, "data.data.value", false);

      // Persist level to skill in data base. 
      await updateProperty(skill, "data.data.level", skill.data.data.level, false);
    }
  }
}

MIGRATORS.push(new Migrator_1_3_2__1_4_0());
