import KeyValuePair from "../../../common/key-value-pair.mjs";
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
 * 
 * @property {Array<KeyValuePair>} challengeRatings
 * @property {Array<KeyValuePair>} attributeGroupExpansionStates 
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

  get challengeRatings() {
    return (this.document.system.challengeRatings ?? []).map(dto => 
      KeyValuePair.fromDto(dto)
    );
  }
  set challengeRatings(value) {
    this.updateByPath("system.challengeRatings", value.map(it => it.toDto()));
  }

  get attributeGroupExpansionStates() {
    return (this.document.system.attributeGroupExpansionStates ?? []).map(dto => 
      KeyValuePair.fromDto(dto)
    );
  }
  set attributeGroupExpansionStates(value) {
    this.updateByPath("system.attributeGroupExpansionStates", value.map(it => it.toDto()));
  }
}

ACTOR_SUBTYPE.set("npc", (document) => { return new TransientNpc(document) });
