import { getExtenders } from "../../../common/extender-util.mjs";
import TransientBaseActor from "./transient-base-actor.mjs";

/**
 * Represents the full transient data of a plain actor. 
 * 
 * @extends TransientBaseActor
 */
export default class TransientPlainActor extends TransientBaseActor {
  /** @override */
  getExtenders() {
    return super.getExtenders().concat(getExtenders(TransientPlainActor));
  }
}
