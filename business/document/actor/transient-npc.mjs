import { getExtenders } from "../../../common/extender-util.mjs";
import ChallengeRating from "../../ruleset/attribute/challenge-rating.mjs";
import { isDefined } from "../../util/validation-utility.mjs";
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
 * @property {ChallengeRating} challengeRating
 * @property {Boolean} isChallengeRatingEnabled
 */
export default class TransientNpc extends TransientBaseCharacterActor {
  /** @override */
  get baseInitiative() {
    if (this.isChallengeRatingEnabled) {
      return (this.challengeRating.value * 3);
    } else {
      return super.baseInitiative;
    }
  }

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

  get challengeRating() {
    if (isDefined(this.document.system.challengeRating)) {
      return ChallengeRating.fromDto(this.document.system.challengeRating);
    } else {
      return new ChallengeRating({
        value: 1,
        modifier: 0,
      });
    }
  }
  /**
   * @param {ChallengeRating} value
   */
  set challengeRating(value) {
    this.updateByPath("system.challengeRating", value.toDto());
  }

  get isChallengeRatingEnabled() {
    return this.document.system.isChallengeRatingEnabled ?? false;
  }
  /**
   * @param {Boolean} newValue
   */
  set isChallengeRatingEnabled(newValue) {
    this.updateByPath("system.isChallengeRatingEnabled", newValue);
  }

  /**
   * @override
   * 
   * Searches in: 
   * * Attributes under consideration of the challenge rating, if it is defined. 
   */
  resolveReference(comparableReference, propertyPath) {
    // Attempt to resolve a challenge rating. 
    const isAttributeReference = this.attributes.find(it => it.name === comparableReference) !== undefined;
    if (isAttributeReference === true && this.isChallengeRatingEnabled === true) {
      return this.challengeRating;
    } else {
      return super.resolveReference(comparableReference, propertyPath);
    }
  }
  
  /** @override */
  getExtenders() {
    return super.getExtenders().concat(getExtenders(TransientNpc));
  }
}
