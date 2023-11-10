import { isDefined } from "../../util/validation-utility.mjs";
import { ACTOR_SUBTYPE } from "./actor-subtype.mjs";
import TransientBaseCharacterActor from "./transient-base-character-actor.mjs";

/**
 * Represents the full transient data of an npc. 
 * 
 * @extends TransientBaseCharacterActor
 * 
 * @property {Boolean} personalityVisible
 * * default `true`
 * @property {Boolean} progressionVisible
 * * default `false`
 * @property {Boolean} physicalAttributesVisible
 * * default `false`
 * @property {Boolean} mentalAttributesVisible
 * * default `false`
 * @property {Boolean} socialAttributesVisible
 * * default `false`
 * 
 * @property {Number | undefined} physicalChallengeRating
 * * default `undefined`
 * @property {Number | undefined} mentalChallengeRating
 * * default `undefined`
 * @property {Number | undefined} socialChallengeRating
 * * default `undefined`
 */
export default class TransientNpc extends TransientBaseCharacterActor {
  get personalityVisible() {
    return this.document.system.personalityVisible ?? true;
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

  get physicalAttributesVisible() {
    return this.document.system.physicalAttributesVisible ?? false;
  }
  set physicalAttributesVisible(value) {
    this.updateByPath("system.physicalAttributesVisible", value);
  }

  get mentalAttributesVisible() {
    return this.document.system.mentalAttributesVisible ?? false;
  }
  set mentalAttributesVisible(value) {
    this.updateByPath("system.mentalAttributesVisible", value);
  }

  get socialAttributesVisible() {
    return this.document.system.socialAttributesVisible ?? false;
  }
  set socialAttributesVisible(value) {
    this.updateByPath("system.socialAttributesVisible", value);
  }

  get physicalChallengeRating() {
    if (isDefined(this.document.system.physicalChallengeRating)) {
      return this.document.system.physicalChallengeRating;
    } else {
      return undefined;
    }
  }
  set physicalChallengeRating(value) {
    if (isDefined(value)) {
      this.updateByPath("system.physicalChallengeRating", value);
    } else {
      this.updateByPath("system.physicalChallengeRating", null);
    }
  }

  get mentalChallengeRating() {
    if (isDefined(this.document.system.mentalChallengeRating)) {
      return this.document.system.mentalChallengeRating;
    } else {
      return undefined;
    }
  }
  set mentalChallengeRating(value) {
    if (isDefined(value)) {
      this.updateByPath("system.mentalChallengeRating", value);
    } else {
      this.updateByPath("system.mentalChallengeRating", null);
    }
  }

  get socialChallengeRating() {
    if (isDefined(this.document.system.socialChallengeRating)) {
      return this.document.system.socialChallengeRating;
    } else {
      return undefined;
    }
  }
  set socialChallengeRating(value) {
    if (isDefined(value)) {
      this.updateByPath("system.socialChallengeRating", value);
    } else {
      this.updateByPath("system.socialChallengeRating", null);
    }
  }
}

ACTOR_SUBTYPE.set("npc", (document) => { return new TransientNpc(document) });
