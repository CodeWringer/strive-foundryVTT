import GameSystemCombat from "../../presentation/combat/game-system-combat.mjs";
import GameSystemCombatant from "../../presentation/combat/game-system-combatant.mjs";
import { GameSystemActor } from "./actor/actor.mjs";
import { GameSystemItem } from "./item/item.mjs";

/**
 * @abstract
 */
export default class DocumentInitializer {
  /**
   * Ensures the global config contains the document declarations. 
   * 
   * @static
   */
  static register() {
    CONFIG.Actor.documentClass = GameSystemActor;
    CONFIG.Item.documentClass = GameSystemItem;
    CONFIG.Combat.documentClass = GameSystemCombat;
    CONFIG.Combatant.documentClass = GameSystemCombatant;
  }
}
