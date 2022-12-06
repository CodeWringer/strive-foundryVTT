import { ACTOR_SUBTYPE } from "./actor-subtype.mjs";
import AmbersteelBaseCharacterActor from "./ambersteel-base-character-actor.mjs";

export default class AmbersteelNpcActor extends AmbersteelBaseCharacterActor {
  // Currently has no specific behavior. 
}

ACTOR_SUBTYPE.set("npc", new AmbersteelNpcActor());
