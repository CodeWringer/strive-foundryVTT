import DocumentFetcher from "../../business/document/document-fetcher/document-fetcher.mjs";
import { GENERAL_DOCUMENT_TYPES } from "../../business/document/general-document-types.mjs";
import GameSystemWorldSettings from "../../business/setting/game-system-world-settings.mjs";
import { ValidationUtil } from "../../business/util/validation-utility.mjs";

/**
 * This class extends FoundryVTT's `Combat` document type. 
 */
export class GameSystemCombat extends Combat {
  /**
   * After the usual turn logic has been completed, handles action point refilling. 
   * 
   * @async
   * @override
   */
  async nextTurn() {
    await super.nextTurn();

    const refillApGlobalSetting = new GameSystemWorldSettings().get(GameSystemWorldSettings.KEY_AUTO_REFILL_ACTION_POINTS);
    
    if (refillApGlobalSetting === true) {
      const currentActor = this.turns[this.turn].actor.getTransientObject();

      if (currentActor.allowAutomaticActionPointRefill === true) {
        const newApCount = Math.min(currentActor.maxActionPoints, currentActor.actionPoints + currentActor.actionPointRefill);
        currentActor.actionPoints = newApCount;
      }
    }
  }

  /**
   * Invoked when a combatant is added. 
   * 
   * @returns {Array<Document>}
   * @override
   * @see https://foundryvtt.com/api/classes/client.Combat.html#createEmbeddedDocuments 
   */
  async createEmbeddedDocuments(embeddedName, data, operation) {
    const newData = data.concat([]);

    for await (const entry of data) {
      const document = await new DocumentFetcher().find({
        id: entry.actorId,
        documentType: GENERAL_DOCUMENT_TYPES.ACTOR,
        includeLocked: false,
        searchEmbedded: false,
      });
      const transientDocument = document.getTransientObject();
      if (ValidationUtil.isDefined(transientDocument.initiative)
        && transientDocument.initiative.perTurn > 1) {
        // Insert additional combatants for this actor. 
        for (let i = 1; i < transientDocument.initiative.perTurn; i++) {
          newData.push({
            actorId: entry.actorId,
            hidden: entry.hidden,
            sceneId: entry.sceneId,
            tokenId: entry.tokenId,
          });
        }
      }
    }

    return await super.createEmbeddedDocuments(embeddedName, newData, operation);
  }
}
