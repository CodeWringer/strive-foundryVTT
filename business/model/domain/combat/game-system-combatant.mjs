import GameSystemSetting from "../../../setting/game-system-setting.mjs";
import { GameSystemWorldSettings } from "../../../setting/game-system-world-settings.mjs";
import { SETTING_SCOPES } from "../../../setting/setting-scopes.mjs";

/**
 * This class extends FoundryVTT's `Combatant` document type. 
 * 
 * @see https://foundryvtt.com/api/classes/client.Combatant.html 
 */
export default class GameSystemCombatant extends Combatant {
  async delete(operation) {
    const autoRemoveOtherCombatants = new GameSystemSetting({ key: GameSystemWorldSettings.KEY_AUTO_REMOVE_SAME_COMBATANTS, scope: SETTING_SCOPES.WORLD });
    if (autoRemoveOtherCombatants === true) {
      const ids = [];
      for (const combatant of this.combat.combatants) {
        if (combatant.id === this.id) continue; // *this* is already in the process of being removed. Exclude it from the following deletions. 

        if (combatant.actorId === this.actorId 
          && combatant.tokenId === this.tokenId 
          && combatant.sceneId === this.sceneId) {
          ids.push(combatant.id);
        }
      }
      this.combat.deleteEmbeddedDocuments(this.documentName, ids);
    }

    return await super.delete(operation);
  }
}
