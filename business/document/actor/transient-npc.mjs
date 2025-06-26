import { ExtenderUtil } from "../../../common/extender-util.mjs";
import TransientBaseCharacterActor from "./transient-base-character-actor.mjs";

/**
 * Represents the full transient data of an npc. 
 * 
 * @extends TransientBaseCharacterActor
 * 
 * @property {Boolean} personalityVisible
 * * default `false`
 * @property {Boolean} progressionVisible
 * * default `false`
 */
export default class TransientNpc extends TransientBaseCharacterActor {
  get personalityVisible() {
    return this.document.system.personalityVisible ?? false;
  }
  set personalityVisible(value) {
    this.updateByPath("system.personalityVisible", value);
  }

  get progressionVisible() {
    return this.document.system.progressionVisible ?? false;
  }
  set progressionVisible(value) {
    this.updateByPath("system.progressionVisible", value);
  }

  /** @override */
  getExtenders() {
    return super.getExtenders().concat(ExtenderUtil.getExtenders(TransientNpc));
  }
}
