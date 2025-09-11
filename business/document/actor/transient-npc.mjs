import { ExtenderUtil } from "../../../common/extender-util.mjs";
import TransientBaseCharacterActor from "./transient-base-character-actor.mjs";

/**
 * Represents the full transient data of an npc. 
 * 
 * @extends TransientBaseCharacterActor
 * 
 * @property {Boolean} personalityVisible
 * * default `false`
 * @property {Boolean} advancementEnabled
 * * default `false`
 */
export default class TransientNpc extends TransientBaseCharacterActor {
  get personalityVisible() {
    return this.document.system.personalityVisible ?? false;
  }
  set personalityVisible(value) {
    this.updateByPath("system.personalityVisible", value);
  }

  /**
   * @type {Boolean}
   * @override
   */
  get advancementEnabled() {
    return this.document.system.advancementEnabled ?? false;
  }
  set advancementEnabled(value) {
    this.updateByPath("system.advancementEnabled", value);
  }

  /** @override */
  getExtenders() {
    return super.getExtenders().concat(ExtenderUtil.getExtenders(TransientNpc));
  }
}
