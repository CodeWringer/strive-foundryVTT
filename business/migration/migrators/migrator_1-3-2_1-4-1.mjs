import { DOCUMENT_COLLECTION_SOURCES } from "../../document/document-fetcher/document-collection-source.mjs";
import DocumentFetcher from "../../document/document-fetcher/document-fetcher.mjs";
import DocumentUpdater from "../../document/document-updater/document-updater.mjs";
import * as PropertyUtility from "../../util/property-utility.mjs";
import AbstractMigrator from "../abstract-migrator.mjs";
import { MIGRATORS } from "../migrators.mjs";
import VersionCode from "../version-code.mjs";

export default class Migrator_1_3_2__1_4_1 extends AbstractMigrator {
  /** @override */
  get targetVersion() { return new VersionCode(1, 3, 2) };

  /** @override */
  get migratedVersion() { return new VersionCode(1, 4, 1) };

  /**
   * @type {DocumentUpdater}
   * @readonly
   * @private
   */
  get updater() {
    if (this._updater === undefined) {
      this._updater = new DocumentUpdater({
        propertyUtility: PropertyUtility,
        logger: game.ambersteel.logger,
      });
    }
    return this._updater;
  }

  /** @override */
  async _doWork() {
    const documentFetcher = new DocumentFetcher();

    // Get all _editable_ actors. 
    // Locked compendia will be excluded in the search. FoundryVTT doesn't allow 
    // editing them and chances are we're dealing with system compendia, 
    // which shouldn't be touched, anyway. 
    const actors = await documentFetcher.findAll({
      documentType: "Actor",
      source: DOCUMENT_COLLECTION_SOURCES.all,
      includeLocked: false,
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

    for (const actor of actors) {
      if (actor.type === "plain") continue;
      
      // Compatibility checks for FoundryVTT version < 10
      const hasSystem = actor.system !== undefined && actor.system !== null;
      const dataPath = hasSystem === true ? "system" : "data.data";
      const actorData = (actor.system ?? actor.data.data);

      // Replace "value" with "level" on every attribute of every actor.

      const attributes = actorData.attributes;

      for (const attributeGroupToMigrate of attributeGroupsToMigrate) {
        const attributeGroup = attributes[attributeGroupToMigrate.groupName];

        for (const attributeName of attributeGroupToMigrate.attributeNames) {
          const attribute = attributeGroup[attributeName];

          if (attribute.value === undefined) continue;

          // Change in-memory data. 
          attribute.level = attribute.value;
          delete attribute.value;

          const dataPath = `${dataPath}.attributes.${attributeGroupToMigrate.groupName}.${attributeName}`;

          // Delete property from attribute in data base. 
          await this.updater.deleteByPath(actor, `${dataPath}.value`, false);
          
          // Persist level to attribute in data base. 
          await this.updater.updateByPath(actor, `${dataPath}.level`, attribute.level, false);
        }
      }

      // Replace any pc's belief and instinct arrays with objects. 
      if (actor.type === "pc") {
        const beliefsArray = actorData.beliefSystem.beliefs;
        const beliefsDataPath = `${dataPath}.beliefSystem.beliefs`;
        const beliefs = {
          _0: beliefsArray[0],
          _1: beliefsArray[1],
          _2: beliefsArray[2]
        };
    
        await this.updater.updateByPath(actor, beliefsDataPath, beliefs, false);
  
        const instinctsArray = actorData.beliefSystem.instincts;
        const instinctsDataPath = `${dataPath}.beliefSystem.instincts`;
        const instincts = {
          _0: instinctsArray[0],
          _1: instinctsArray[1],
          _2: instinctsArray[2]
        };
    
        await this.updater.updateByPath(actor, instinctsDataPath, instincts, false);
      }
    }
    
    // Get all _editable_ skills.
    // Locked compendia will be excluded in the search. FoundryVTT doesn't allow 
    // editing them and chances are we're dealing with system compendia, 
    // which shouldn't be touched, anyway. 
    const skills = await documentFetcher.findAll({
      documentType: "Item",
      contentType: "skill",
      searchEmbedded: true,
      source: DOCUMENT_COLLECTION_SOURCES.all,
      includeLocked: false,
    });

    // Replace "value" with "level" on every skill.
    for (const skill of skills) {
      // Ensure skill abilities are updated to now be stored on an object, instead of an array. 
      await skill.getTransientObject().persistSkillAbilities(false);

      const skillData = (skill.system ?? skill.data.data);
      
      if (skillData.value === undefined) continue;
      
      // Change in-memory data. 
      skillData.level = skillData.value;
      delete skillData.value;

      // Delete property from skill in data base. 
      await this.updater.deleteByPath(skill, `${dataPath}.value`, false);

      // Persist level to skill in data base. 
      await this.updater.updateByPath(skill, `${dataPath}.level`, skillData.level, false);
    }
  }
}

MIGRATORS.push(new Migrator_1_3_2__1_4_1());