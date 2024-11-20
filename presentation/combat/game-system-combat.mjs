import DocumentFetcher from "../../business/document/document-fetcher/document-fetcher.mjs";
import { GENERAL_DOCUMENT_TYPES } from "../../business/document/general-document-types.mjs";
import GameSystemWorldSettings from "../../business/setting/game-system-world-settings.mjs";
import { ArrayUtil } from "../../business/util/array-utility.mjs";
import { ValidationUtil } from "../../business/util/validation-utility.mjs";

/**
 * This class extends FoundryVTT's `Combat` document type. 
 * 
 * @see https://foundryvtt.com/api/classes/client.Combat.html 
 */
export default class GameSystemCombat extends Combat {
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

      if (currentActor.actionPoints.refill.enable === true) {
        const newApCount = Math.min(currentActor.actionPoints.maximum, currentActor.actionPoints.current + currentActor.actionPoints.refill.amount);
        currentActor.actionPoints.current = newApCount;
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

  /**
   * @param {Array<String>} ids Combatant IDs. 
   * @param {Object} options 
   * 
   * @returns {Combat}
   */
  async rollInitiative(ids, options) {
    const tokensToCombatantsMap = new Map();
    for (const id of ids) {
      const combatant = this.combatants.get(id);
      const combatantIds = tokensToCombatantsMap.get(combatant.tokenId) ?? [];
      combatantIds.push(id);
      tokensToCombatantsMap.set(combatant.tokenId, combatantIds);
    }

    const divisorToIdsMap = new Map();
    for (const tokenId of tokensToCombatantsMap.keys()) {
      // Find all combatants of the token. 
      const combatantsOfToken = this._getCombatantsOfToken(tokenId);
      // Count the number of them that already have an initiative. 
      let initiativeCount = 1;
      for (const combatantOfToken of combatantsOfToken) {
        // Avoid counting initiative of combatants that are about to be re-rolled. 
        if (ArrayUtil.arrayContains(ids, combatantOfToken.id)) {
          continue;
        }
        if (ValidationUtil.isDefined(combatantOfToken.initiative)) {
          initiativeCount++;
        }
      }

      const combatantIds = tokensToCombatantsMap.get(tokenId);
      for (let i = 0; i < combatantIds.length; i++) {
        const combatantId = combatantIds[i];
        const divisor = initiativeCount + i;
        const combatantIdsForDivisor = divisorToIdsMap.get(divisor) ?? [];
        combatantIdsForDivisor.push(combatantId);
        divisorToIdsMap.set(divisor, combatantIdsForDivisor);
      }
    }

    let updatedCombat;
    const initiativeFormula = CONFIG.Combat.initiative.formula;
    for (const divisor of divisorToIdsMap.keys()) {
      const options = {
        formula: `(${initiativeFormula}) / ${divisor}`,
        updateTurn: false,
        messageOptions: {},
      };
      const idsToRoll = divisorToIdsMap.get(divisor);
      updatedCombat = await super.rollInitiative(idsToRoll, options);
    }

    return updatedCombat;
  }

  /**
   * Returns all combatants that belong to the given token. 
   * 
   * @param {String} tokenId ID of a token. 
   * 
   * @returns {Array<Combatant>}
   * 
   * @private
   */
  _getCombatantsOfToken(tokenId) {
    const combatants = [];
    for (const combatant of this.combatants) {
      if (combatant.tokenId === tokenId) {
        combatants.push(combatant);
      }
    }
    return combatants;
  }
}
