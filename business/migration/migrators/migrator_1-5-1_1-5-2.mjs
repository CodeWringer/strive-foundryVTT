import { DOCUMENT_COLLECTION_SOURCES } from "../../document/document-fetcher/document-collection-source.mjs";
import DocumentFetcher from "../../document/document-fetcher/document-fetcher.mjs";
import DocumentUpdater from "../../document/document-updater/document-updater.mjs";
import * as PropertyUtility from "../../util/property-utility.mjs";
import AbstractMigrator from "../abstract-migrator.mjs";
import { MIGRATORS } from "../migrators.mjs";
import VersionCode from "../version-code.mjs";

export default class Migrator_1_5_1__1_5_2 extends AbstractMigrator {
  /** @override */
  get targetVersion() { return new VersionCode(1, 5, 1) };

  /** @override */
  get migratedVersion() { return new VersionCode(1, 5, 2) };

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
        // Migrate from "instincts" to "reactions". 
        
        const instincts = actorData.beliefSystem.instincts;
        if (instincts !== undefined) {
          const reactions = {
            _0: instincts._0 ?? "",
            _1: instincts._1 ?? "",
            _2: instincts._2 ?? "",
          };
          const instinctsDataPath = `${dataPath}.beliefSystem.instincts`;
          const reactionsDataPath = `${dataPath}.beliefSystem.reactions`;
          await this.updater.updateByPath(actor, reactionsDataPath, reactions, false);
          await this.updater.deleteByPath(actor, instinctsDataPath, false);
        }
      }
    }
  }
}

MIGRATORS.push(new Migrator_1_5_1__1_5_2());
