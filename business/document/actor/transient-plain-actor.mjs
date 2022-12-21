import { ACTOR_SUBTYPE } from "./actor-subtype.mjs";
import TransientBaseActor from "./transient-base-actor.mjs";

/**
 * Represents the full transient data of a plain actor. 
 * 
 * @extends TransientBaseActor
 */
export default class TransientPlainActor extends TransientBaseActor {
  // Currently has no specific behavior. 
}

ACTOR_SUBTYPE.set("plain", (document) => { return new TransientPlainActor(document) });
