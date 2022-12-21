import { ACTOR_SUBTYPE } from "./actor-subtype.mjs";
import TransientBaseCharacterActor from "./transient-base-character-actor.mjs";

/**
 * Represents the full transient data of an npc. 
 * 
 * @extends TransientBaseCharacterActor
 */
export default class TransientNpc extends TransientBaseCharacterActor {
  // Currently has no specific behavior. 
}

ACTOR_SUBTYPE.set("npc", (document) => { return new TransientNpc(document) });
