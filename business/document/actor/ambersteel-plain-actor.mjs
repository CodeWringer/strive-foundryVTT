import { ACTOR_SUBTYPE } from "./actor-subtype.mjs";
import AmbersteelBaseActor from "./ambersteel-base-actor.mjs";

export default class AmbersteelPlainActor extends AmbersteelBaseActor {
  // Currently has no specific behavior. 
}

ACTOR_SUBTYPE.set("plain", new AmbersteelPlainActor());
