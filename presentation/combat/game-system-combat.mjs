import GameSystemUserSettings from "../../business/setting/game-system-user-settings.mjs";
import GameSystemWorldSettings from "../../business/setting/game-system-world-settings.mjs";

/**
 * @summary
 * This class represents FoundryVTT's `Combat` document type. 
 */
export class GameSystemCombat extends Combat {
  /**
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
}
