import KeyValuePair from "../../../common/key-value-pair.mjs";
import { getGroupForAttributeByName } from "../../ruleset/attribute/attribute-groups.mjs";
import { ATTRIBUTES } from "../../ruleset/attribute/attributes.mjs";
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
  /** @override */
  get baseInitiative() {
    const attributesToSum = [
      ATTRIBUTES.perception.name,
      ATTRIBUTES.intelligence.name,
      ATTRIBUTES.empathy.name,
    ];

    let baseInitiative = 0;

    for (const attributeName of attributesToSum) {
      const attributeGroup = getGroupForAttributeByName(attributeName);
      const isCrActive = this.getIsCrActiveFor(attributeGroup.name);
      if (isCrActive === true) {
        baseInitiative += this.getCrFor(attributeGroup.name);
      } else {
        baseInitiative += this.attributes.find(it => it.name === attributeName).modifiedLevel;
      }
    }

    return baseInitiative;
  }

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

  /**
   * Returns `true`, if the attribute group with the given name has an 
   * **active** challenge rating set. 
   * 
   * @param {String} attributeGroupName Name of the attribute group. 
   * 
   * @returns {Boolean}
   */
  getIsCrActiveFor(attributeGroupName) {
    return !this.getIsExpandedFor(attributeGroupName);
  }

  /**
   * Returns `true`, if the attribute group with the given name is expanded. 
   * 
   * @param {String} attributeGroupName Name of the attribute group. 
   * 
   * @returns {Boolean}
   */
  getIsExpandedFor(attributeGroupName) {
    return ((this.attributeGroupExpansionStates.find(it => it.key === attributeGroupName) ?? {}).value ?? false);
  }

  /**
   * Returns the challenge rating of the attribute group with the given name. 
   * 
   * @param {String} attributeGroupName Name of the attribute group. 
   * 
   * @returns {Number}
   */
  getCrFor(attributeGroupName) {
    return (this.challengeRatings.find(it => it.key === attributeGroupName) ?? {}).value ?? 0;
  }

  /**
   * @override
   * 
   * Searches in: 
   * * Challenge ratings.
   */
  resolveReference(comparableReference, propertyPath) {
    // Attempt to resolve a challenge rating. 
    const attributeGroup = getGroupForAttributeByName(comparableReference);
    if (attributeGroup !== undefined) {
      const isCrActive = this.getIsCrActiveFor(attributeGroup.name);
      if (isCrActive === true) {
        return this.getCrFor(attributeGroup.name);
      }
    }
    
    return super.resolveReference(comparableReference, propertyPath);
  }
}

ACTOR_SUBTYPE.set("npc", (document) => { return new TransientNpc(document) });
