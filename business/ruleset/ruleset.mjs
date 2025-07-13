import LevelAdvancement from "./level-advancement.mjs";
import { SkillTier, SKILL_TIERS } from "./skill/skill-tier.mjs";
import { ATTRIBUTE_TIERS, AttributeTier } from "./attribute/attribute-tier.mjs";
import { ATTRIBUTES, Attribute } from "./attribute/attributes.mjs";
import TransientSkill from "../document/item/skill/transient-skill.mjs";
import { ACTOR_TYPES } from "../document/actor/actor-types.mjs";
import { ITEM_TYPES } from "../document/item/item-types.mjs";
import { SkillRollSchema } from "../dice/ability-roll/skill-roll-schema.mjs";
import { RollSchema } from "../dice/roll-schema.mjs";
import { AttributeRollSchema } from "../dice/ability-roll/attribute-roll-schema.mjs";
import { AttributeAndSkillRollSchema } from "../dice/ability-roll/attribute-and-skill-roll-schema/attribute-and-skill-roll-schema.mjs";
import { ValidationUtil } from "../util/validation-utility.mjs";

/**
 * Provides all the ruleset-specifics. 
 */
export default class Ruleset {
  /**
   * Returns the tier of the given level of an attribute. 
   * 
   * @param {Number} level The level for which to get the attribute tier. 
   * 
   * @returns {AttributeTier}
   */
  getAttributeLevelTier(level = 0) {
    if (level < 3) {
      return ATTRIBUTE_TIERS.underdeveloped;
    } else if (level < 5) {
      return ATTRIBUTE_TIERS.average;
    } else {
      return ATTRIBUTE_TIERS.exceptional;
    }
  }

  /**
   * Returns the advancement requirements for the given level of an attribute. 
   * 
   * @param {Number} level The level for which to get the advancement requirements. 
   * 
   * @returns {Number}
   */
  getAttributeAdvancementRequirements(level = 0) {
    const tier = this.getAttributeLevelTier(level);

    if (tier.name === ATTRIBUTE_TIERS.underdeveloped.name) {
      return level * 10;
    } else if (tier.name === ATTRIBUTE_TIERS.average.name) {
      return level * 7;
    } else if (tier.name === ATTRIBUTE_TIERS.exceptional.name) {
      return level * 8;
    } else {
      throw new Error(`Unrecognized attribute tier ${tier.name}`);
    }
  }
    
  /**
   * Returns the tier of the given level of a skill. 
   * 
   * @param {Number} level The level for which to get the skill tier. 
   * 
   * @returns {SkillTier}
   */
  getSkillLevelTier(level = 0) {
    if (level < 1) {
      return SKILL_TIERS.dabbling;
    } else if (level < 5) {
      return SKILL_TIERS.apprentice;
    } else {
      return SKILL_TIERS.master;
    }
  }

  /**
   * Returns the advancement requirements for the given level of a skill. 
   * 
   * @param {Number} level The level for which to get the advancement requirements. 
   * 
   * @returns {LevelAdvancement}
   * 
   * @throws When the given level does not result in a valid skill tier. 
   */
  getSkillAdvancementRequirements(level = 0) {
    const tier = this.getSkillLevelTier(level);
    let successes = 0;
    let failures = 0;

    if (tier.name === SKILL_TIERS.dabbling.name) {
      successes = 6;
      failures = 9;
    } else if (tier.name === SKILL_TIERS.apprentice.name) {
      successes = level + 3;
      failures = (level * 2) + 4;
    } else if (tier.name === SKILL_TIERS.master.name) {
      successes = level + 4;
      failures = (level * 2) + 5;
    } else {
      throw new Error(`Unrecognized skill tier ${tier.name}`);
    }

    return new LevelAdvancement({
      successes: successes,
      failures: failures
    });
  }

  /**
   * Returns true, if the given face/number represents a hit.
   * 
   * @param {String | Number} face A die face to check whether it represents a hit.
   * 
   * @returns {Boolean}
   * 
   * @throws {Error} Thrown, if the given face is outside the valid range of 0 (inclusive) to 6 (inclusive).
   */
  isHit(face) {
    const int = parseInt(face);

    if (int < 0 || int > 6) throw new Error("Die face count out of range [0-6]");

    return int > 4;
  }

  /**
   * Returns true, if the given face/number represents a miss.
   * 
   * @param {String | Number} face A die face to check whether it represents a miss.
   * 
   * @returns {Boolean}
   * 
   * @throws {Error} Thrown, if the given face is outside the valid range of 0 (inclusive) to 6 (inclusive).
   */
  isMiss(face) {
    const int = parseInt(face);

    if (int < 0 || int > 6) throw new Error("Die face count out of range [0-6]");

    return int < 5;
  }

  /**
   * Returns the maximum HP reduction per injury of the given actor. 
   * 
   * @param {Actor} actor 
   * 
   * @returns {Number}
   */
  getMaximumHpReductionPerInjury(actor) {
    const toughnessLevel = parseInt(this.getEffectiveAttributeRawLevel(ATTRIBUTES.toughness, actor));
    const hpReductionPerInjury = 10 - Math.floor(toughnessLevel / 2);

    return hpReductionPerInjury;
  }

  /**
   * Returns the base HP of all characters. 
   * 
   * @returns {Number}
   */
  getCharacterBaseHp() {
    return 10;
  }

  /**
   * @type {Number}
   * @readonly
   */
  hpPerLevel = 10;

  /**
   * Returns the unmodified maximum HP of the given actor. 
   * 
   * Unmodified means without the maximum HP penalty from injuries. 
   * 
   * @param {Actor} actor 
   * 
   * @returns {Number}
   */
  getUnmodifiedMaximumHp(actor) {
    const baseHp = this.getCharacterBaseHp();
    const toughnessLevel = parseInt(this.getEffectiveAttributeRawLevel(ATTRIBUTES.toughness, actor));

    return Math.max(baseHp, baseHp + (toughnessLevel * this.hpPerLevel));
  }

  /**
   * Returns the *current* maximum HP penalty from injuries of the given actor. 
   * 
   * @param {Actor} actor 
   * 
   * @returns {Number}
   * 
   * @throws {Error} Thrown, if the given actor is not of type `"pc"` or `"npc"`. 
   */
  getCharacterMaximumHpReduction(actor) {
    const type = actor.type.toLowerCase();
    if (type !== ACTOR_TYPES.PC && type !== ACTOR_TYPES.NPC) {
      throw new Error("Only PC and NPC type actors supported");
    }

    const injuryCount = (actor.items.filter(it => it.type === ITEM_TYPES.INJURY)).length;
    const hpReductionPerInjury = this.getMaximumHpReductionPerInjury(actor);

    return injuryCount * hpReductionPerInjury;
  }

  /**
   * Returns the *current* maximum HP of the given actor. 
   * 
   * @param {Actor} actor 
   * 
   * @returns {Number}
   * 
   * @throws {Error} Thrown, if the given actor is not of type `"pc"` or `"npc"`. 
   */
  getCharacterMaximumHp(actor) {
    const type = actor.type.toLowerCase();
    if (type !== ACTOR_TYPES.PC && type !== ACTOR_TYPES.NPC) {
      throw new Error("Only PC and NPC type actors supported");
    }

    const unmodifiedHp = this.getUnmodifiedMaximumHp(actor);
    const hpReduction = this.getCharacterMaximumHpReduction(actor);

    return unmodifiedHp - hpReduction;
  }

  /**
   * Returns the exhaustion limit of the given actor. 
   * 
   * @param {Actor} actor 
   * 
   * @returns {Number}
   * 
   * @throws {Error} Thrown, if the given actor is not of type `"pc"` or `"npc"`. 
   */
  getCharacterMaximumExhaustion(actor) {
    const type = actor.type.toLowerCase();
    if (type !== ACTOR_TYPES.PC && type !== ACTOR_TYPES.NPC) {
      throw new Error("Only PC and NPC type actors supported");
    }
    
    const base = 1;
    const level = this.getEffectiveAttributeRawLevel(ATTRIBUTES.toughness, actor);

    return base + parseInt(level);
  }
  
  /**
   * Returns the maximum inventory slot size of the given actor. 
   * 
   * @param {Actor} actor 
   * 
   * @returns {Number}
   * 
   * @throws {Error} Thrown, if the given actor is not of type `"pc"` or `"npc"`. 
   */
  getCharacterCarryingCapacity(actor) {
    const type = actor.type.toLowerCase();
    if (type !== ACTOR_TYPES.PC && type !== ACTOR_TYPES.NPC) throw new Error("Only PC and NPC type actors allowed");

    const level = this.getEffectiveAttributeModifiedLevel(ATTRIBUTES.strength, actor);

    return level * 3;
  }

  /**
   * Returns the asset slot maximum bulk bonus, based on the given character's strength. 
   * 
   * @param {Actor} actor 
   * 
   * @returns {Number}
   */
  getAssetSlotBonus(actor) {
    const type = actor.type.toLowerCase();
    if (type !== ACTOR_TYPES.PC && type !== ACTOR_TYPES.NPC) throw new Error("Only PC and NPC type actors allowed");

    const level = this.getEffectiveAttributeModifiedLevel(ATTRIBUTES.strength, actor);

    return Math.max(0, Math.floor((level - 1) / 3));
  }

  /**
   * Returns the maximum number of fate cards that can be accrued on a character. 
   * 
   * @returns {Number} The maximum number of fate cards. 
   */
  getMaximumFateCards() {
    return 5;
  }

  /**
   * Returns the effective raw level of the given actor for the given 
   * attribute. 
   * 
   * @param {Attribute} attribute The attribute whose effective level 
   * is to be returned. 
   * @param {Actor} actor The actor whose attribute it is. 
   * 
   * @returns {Number} The raw level. 
   */
  getEffectiveAttributeRawLevel(attribute, actor) {
    const type = actor.type.toLowerCase();
    if (type !== ACTOR_TYPES.PC && type !== ACTOR_TYPES.NPC) {
      throw new Error("Only PC and NPC type actors supported");
    }

    const transientActor = actor.getTransientObject();
    const characterAttribute = transientActor.attributes.find(it => it.name === attribute.name);
    return characterAttribute.level;
  }
  
  /**
   * Returns the effective modified level of the given actor for the 
   * given attribute. 
   * 
   * @param {Attribute} attribute The attribute whose effective level 
   * is to be returned. 
   * @param {Actor} actor The actor whose attribute it is. 
   * 
   * @returns {Number} The modified level. 
   */
  getEffectiveAttributeModifiedLevel(attribute, actor) {
    const type = actor.type.toLowerCase();
    if (type !== ACTOR_TYPES.PC && type !== ACTOR_TYPES.NPC) {
      throw new Error("Only PC and NPC type actors supported");
    }

    const transientActor = actor.getTransientObject();
    const characterAttribute = transientActor.attributes.find(it => it.name === attribute.name);
    if (!ValidationUtil.isDefined(characterAttribute)) {
      game.strive.logger.logError(`Failed to find attribute by name ${attribute.name} on actor ${transientActor.id}`);
      return;
    }
    return characterAttribute.modifiedLevel;
  }

  /**
   * Returns the effective modified level of the given actor for the 
   * given skill. 
   * 
   * @param {Item | TransientSkill} skill The skill whose effective level 
   * is to be returned. 
   * @param {Actor} actor The actor whose skill it is. 
   * 
   * @returns {Number} The modified level. 
   */
  getEffectiveSkillModifiedLevel(skill, actor) {
    const type = actor.type.toLowerCase();
    if (type !== ACTOR_TYPES.PC && type !== ACTOR_TYPES.NPC) {
      throw new Error("Only PC and NPC type actors supported");
    }

    const transientActor = actor.getTransientObject();
    const transientSkill = skill.getTransientObject();
    return transientSkill.modifiedLevel;
  }

  /**
   * Returns the default skill roll schema. 
   * 
   * @returns {SkillRollSchema}
   */
  getSkillRollSchema() {
    return new AttributeAndSkillRollSchema(); 
  }

  /**
   * Returns the default skill roll schema. 
   * 
   * @returns {RollSchema}
   */
  getAttributeRollSchema() {
    return new AttributeRollSchema();
  }
}
