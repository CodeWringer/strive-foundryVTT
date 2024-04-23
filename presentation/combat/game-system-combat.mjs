import GameSystemWorldSettings from "../../business/setting/game-system-world-settings.mjs";

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
}
