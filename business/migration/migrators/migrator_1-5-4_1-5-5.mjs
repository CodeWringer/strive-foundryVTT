import DocumentUpdater from "../../document/document-updater/document-updater.mjs";
import AbstractMigrator from "../abstract-migrator.mjs";
import { MIGRATORS } from "../migrators.mjs";
import VersionCode from "../version-code.mjs";
import * as PropertyUtility from "../../util/property-utility.mjs";
import DocumentFetcher from "../../document/document-fetcher/document-fetcher.mjs";
import { DOCUMENT_COLLECTION_SOURCES } from "../../document/document-fetcher/document-collection-source.mjs";

export default class Migrator_1_5_4__1_5_5 extends AbstractMigrator {
  /** @override */
  get targetVersion() { return new VersionCode(1, 5, 4) };

  /** @override */
  get migratedVersion() { return new VersionCode(1, 5, 5) };

  /**
   * @type {DocumentUpdater}
   * @readonly
   * @protected
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

  /**
   * @type {DocumentFetcher}
   * @readonly
   * @protected
   */
  get fetcher() {
    if (this._fetcher === undefined) {
      this._fetcher = new DocumentFetcher();
    }
    return this._fetcher;
  }

  /** @override */
  async _doWork() {
    // Get all _editable_ actors. 
    // Locked compendia will be excluded in the search. FoundryVTT doesn't allow 
    // editing them and chances are we're dealing with system compendia, 
    // which shouldn't be touched, anyway. 
    const editableActors = await this.fetcher.findAll({
      documentType: "Actor",
      source: DOCUMENT_COLLECTION_SOURCES.all,
      includeLocked: false,
    });

    const attributeDefinitions = [
      { group: "physical", attribute: "agility" },
      { group: "physical", attribute: "endurance" },
      { group: "physical", attribute: "perception" },
      { group: "physical", attribute: "strength" },
      { group: "physical", attribute: "toughness" },
      { group: "mental", attribute: "intelligence" },
      { group: "mental", attribute: "wisdom" },
      { group: "mental", attribute: "arcana" },
      { group: "social", attribute: "empathy" },
      { group: "social", attribute: "oratory" },
      { group: "social", attribute: "willpower" },
    ];

    for (const actor of editableActors) {
      if (actor.type === "plain") continue;

      const actorData = this._getData(actor);

      // Migrate attribute progress. 
      
      // Determine update delta for the actor. 
      const updateDelta = {
        attributes: {
          physical: {},
          mental: {},
          social: {},
        }
      };

      let migratable = true;

      for (const attributeDefinition of attributeDefinitions) {
        const attributeData = actorData.attributes[attributeDefinition.group][attributeDefinition.attribute];
        
        if (attributeData.successes !== undefined && attributeData.failures !== undefined) {
          const progress = parseInt(attributeData.successes) + parseInt(attributeData.failures);
          updateDelta.attributes[attributeDefinition.group][attributeDefinition.attribute] = {
            "-=successes": null,
            "-=failures": null,
            progress: progress,
          };
        } else {
          game.ambersteel.logger.logWarn(`Skipping actor attribute migration for actor '${actor.name}' because of missing 'successes' and 'failures' field`);
          migratable = false;
          break;
        }
      }

      if (migratable === true) {
        // Do the update. 
        const dataPath = this._getDataPath(actor);
        await this.updater.updateByPath(actor, dataPath, updateDelta, false);
      }
    }
  }

  /**
   * Returns the data object of the given document instance. 
   * 
   * @param {Document} document A raw document instance. 
   * 
   * @returns {Object} The data object. I. e. `data.data` or `system`. 
   */
  _getData(document) {
    return (document.system ?? document.data.data);
  }

  /**
   * Returns the data path of the given document instance. 
   * 
   * @param {Document} document A raw document instance. 
   * 
   * @returns {String} The data path. I. e. `"data.data"` or `"system"`. 
   */
  _getDataPath(document) {
    const hasSystem = document.system !== undefined && document.system !== null;
    return (hasSystem === true) ? "system" : "data.data";
  }
}

MIGRATORS.push(new Migrator_1_5_4__1_5_5());
