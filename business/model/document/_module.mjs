import { ACTOR_TYPES } from "./actor/actor-types.mjs";
import TransientDocument from "./transient-document.mjs";
import TransientBaseItem from "./item/transient-base-item.mjs";
import TransientBaseActor from "./actor/transient-base-actor.mjs";
import TransientBaseCharacterActor from "./actor/transient-base-character-actor.mjs";
import TransientNpc from "./actor/transient-npc.mjs";
import TransientPc from "./actor/transient-pc.mjs";
import TransientPlainActor from "./actor/transient-plain-actor.mjs";
import { GameSystemActor } from "./actor/actor.mjs";
import { GameSystemItem } from "./item/item.mjs";
import GameSystemCombat from "../../../presentation/combat/game-system-combat.mjs";
import GameSystemCombatant from "../../../presentation/combat/game-system-combatant.mjs";

export {
  ACTOR_TYPES,
  TransientDocument,
  TransientBaseItem,
  TransientBaseActor,
  TransientBaseCharacterActor,
  TransientNpc,
  TransientPc,
  TransientPlainActor,
  GameSystemActor,
};

/**
 * Wraps the `business.model.document` module.
 * 
 * Note the `init` function MUST be called during system setup!
 */
export const document = {
  TransientDocument: TransientDocument,
  actor: {
    ACTOR_TYPES: ACTOR_TYPES,
    TransientBaseActor: TransientBaseActor,
    TransientBaseCharacterActor: TransientBaseCharacterActor,
    TransientNpc: TransientNpc,
    TransientPc: TransientPc,
    TransientPlainActor: TransientPlainActor,
    GameSystemActor: GameSystemActor,
  },
  item: {
    TransientBaseItem: TransientBaseItem,
  },
  init() {
    CONFIG.Actor.documentClass = GameSystemActor;
    CONFIG.Item.documentClass = GameSystemItem;
    CONFIG.Combat.documentClass = GameSystemCombat;
    CONFIG.Combatant.documentClass = GameSystemCombatant;
  },
};
