import { DOCUMENT_COLLECTION_SOURCES } from "../../document/document-fetcher/document-collection-source.mjs";
import DocumentFetcher from "../../document/document-fetcher/document-fetcher.mjs";
import DocumentUpdater from "../../document/document-updater/document-updater.mjs";
import { SKILL_TAGS } from "../../tags/system-tags.mjs";
import { ArrayUtil } from "../../util/array-utility.mjs";
import { PropertyUtil } from "../../util/property-utility.mjs";
import AbstractMigrator from "../abstract-migrator.mjs";
import VersionCode from "../version-code.mjs";

export default class Migrator_1_5_2__1_5_3 extends AbstractMigrator {
  /** @override */
  get targetVersion() { return new VersionCode(1, 5, 2) };

  /** @override */
  get migratedVersion() { return new VersionCode(1, 5, 3) };

  /**
   * @type {DocumentUpdater}
   * @readonly
   * @private
   */
  get updater() {
    if (this._updater === undefined) {
      this._updater = new DocumentUpdater({
        propertyUtility: PropertyUtil,
        logger: game.strive.logger,
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
    const editableActors = await documentFetcher.findAll({
      documentType: "Actor",
      source: DOCUMENT_COLLECTION_SOURCES.all,
      includeLocked: false,
    });

    for (const actor of editableActors) {
      if (actor.type === "plain") continue;

      // Compatibility checks for FoundryVTT version < 10
      const hasSystem = actor.system !== undefined && actor.system !== null;
      const dataPath = hasSystem === true ? "system" : "data.data";
      const actorData = (actor.system ?? actor.data.data);

      if (actor.type === "pc") {
        if (actorData.beliefSystem !== undefined) {
          // Migrate from "beliefSystem" to "driverSystem". 

          const ambition = actorData.beliefSystem.ambition;
          const reactions = actorData.beliefSystem.reactions;

          const beliefs = actorData.beliefSystem.beliefs;
          const aspirations = {
            _0: beliefs._0 ?? "",
            _1: beliefs._1 ?? "",
            _2: beliefs._2 ?? "",
          };

          const driverSystem = {
            ambition: ambition,
            aspirations: aspirations,
            reactions: reactions,
          };

          const pathFrom = `${dataPath}.beliefSystem`;
          const pathTo = `${dataPath}.driverSystem`;
          await this.updater.updateByPath(actor, pathTo, driverSystem, false);
          await this.updater.deleteByPath(actor, pathFrom, false);
        }
      }
    }
    
    // Get all _editable_ skills. 
    // Locked compendia will be excluded in the search. FoundryVTT doesn't allow 
    // editing them and chances are we're dealing with system compendia, 
    // which shouldn't be touched, anyway. 
    const editableSkills = await documentFetcher.findAll({
      documentType: "Item",
      contentType: "skill",
      source: DOCUMENT_COLLECTION_SOURCES.all,
      includeLocked: false,
    });

    for (const skill of editableSkills) {
      // Compatibility checks for FoundryVTT version < 10
      const hasSystem = skill.system !== undefined && skill.system !== null;
      const dataPath = hasSystem === true ? "system" : "data.data";
      const systemData = (skill.system ?? skill.data.data);
      const properties = systemData.properties;

      // Migrate from `isMagicSchool` field to the more generic properties list. 
      const isMagicSchool = (systemData.isMagicSchool === true);
      if (isMagicSchool === true) {
        if (ArrayUtil.arrayContains(properties, SKILL_TAGS.MAGIC_SCHOOL.id) !== true) {
          properties.push(SKILL_TAGS.MAGIC_SCHOOL.id);
          await this.updater.updateByPath(skill, `${dataPath}.properties`, properties, false);
        }
      }
      // Delete the now obsolete `isMagicSchool` field. 
      await this.updater.deleteByPath(skill, `${dataPath}.isMagicSchool`, false);
    }
  }
}
