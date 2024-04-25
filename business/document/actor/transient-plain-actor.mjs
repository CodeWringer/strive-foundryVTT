import { ACTOR_SUBTYPE } from "./actor-subtype.mjs";
import TransientBaseActor from "./transient-base-actor.mjs";

/**
 * Represents the full transient data of a plain actor. 
 * 
 * @extends TransientBaseActor
 */
export default class TransientPlainActor extends TransientBaseActor {
  /** @override */
  static get TYPE() { return "plain"; }
}

ACTOR_SUBTYPE.set(TransientPlainActor.TYPE, (document) => { return new TransientPlainActor(document) });
