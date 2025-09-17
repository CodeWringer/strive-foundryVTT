import { ExtenderUtil } from "../../../common/extender-util.mjs";
import { PropertyUtil } from "../../util/property-utility.mjs";
import TransientBaseCharacterActor from "./transient-base-character-actor.mjs";

/**
 * Represents the full transient data of an npc. 
 * 
 * @extends TransientBaseCharacterActor
 * 
 * @property {Boolean} personalityVisible
 * * default `false`
 * @property {Object} advancement
 * @property {Boolean} advancement.advancementEnabled
 * * default `false`
 * @property {Number} advancement.xp
 */
export default class TransientNpc extends TransientBaseCharacterActor {
  get personalityVisible() {
    return this.document.system.personalityVisible ?? false;
  }
  set personalityVisible(value) {
    this.updateByPath("system.personalityVisible", value);
  }

  /**
   * @type {Object}
   * @readonly
   * @override
   */
  get advancement() {
    const thiz = this;
    return {
      /**
       * @type {Boolean}
       */
      get advancementEnabled() { return PropertyUtil.guaranteeObject(thiz.document.system.advancement).advancementEnabled ?? false; },
      set advancementEnabled(value) { thiz.updateByPath("system.advancement.advancementEnabled", value); },
      /**
       * @type {Number}
       */
      get xp() { return PropertyUtil.guaranteeObject(thiz.document.system.advancement).xp ?? 0; },
      set xp(value) { thiz.updateByPath("system.advancement.xp", value); },
    };
  }

  /** @override */
  getExtenders() {
    return super.getExtenders().concat(ExtenderUtil.getExtenders(TransientNpc));
  }
}
