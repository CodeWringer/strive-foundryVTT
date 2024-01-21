import LevelAdvancement from "./level-advancement.mjs";
import { getGroupForAttributeByName } from "./attribute/attribute-groups.mjs";
import { Sum, SumComponent } from "./summed-data.mjs";
import { SkillTier, SKILL_TIERS } from "./skill/skill-tier.mjs";
import { ATTRIBUTE_TIERS, AttributeTier } from "./attribute/attribute-tier.mjs";
import { DICE_POOL_RESULT_TYPES, DicePoolRollResult } from "../dice/dice-pool.mjs";
import { ATTRIBUTES, Attribute } from "./attribute/attributes.mjs";
import TransientSkill from "../document/item/skill/transient-skill.mjs";

/**
 * Provides all the ruleset-specifics. 
 */
export default class Ruleset {
  /**
   * Returns the number of dice for a skill test. 
   * 
   * @param {Number} skillLevel A skill level. 
   * @param {Number} activeBaseAttribute Level of the active base attribute. 
   * 
   * @returns {Object} { totalDiceCount: {Number}, skillDiceCount: {Number}, attributeDiceCount: {Number} }
   */
  getSkillTestNumberOfDice(skillLevel, activeBaseAttribute) {
    return {
      totalDiceCount: skillLevel + activeBaseAttribute,
      skillDiceCount: skillLevel,
      attributeDiceCount: activeBaseAttribute
    };
  }

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
    } else if (level < 6) {
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
      return 15 + (level * 4);
    } else if (tier.name === ATTRIBUTE_TIERS.average.name) {
      return (level + 3) * (level + 2);
    } else if (tier.name === ATTRIBUTE_TIERS.exceptional.name) {
      return (level + 4) * (level + 3);
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
      successes = (level + 1) * 2;
      failures = (level + 1) * 3;
    } else if (tier.name === SKILL_TIERS.master.name) {
      successes = level * level;
      failures = (level + 1) * (level + 1);
    } else {
      throw new Error(`Unrecognized skill tier ${tier.name}`);
    }

    return new LevelAdvancement({
      successes: successes,
      failures: failures
    });
  }

  /**
   * Returns the name of the attribute group containing the given attribute. 
   * 
   * @param {String} attributeName Internal name of an attribute, e.g. `"arcana"`. 
   * 
   * @returns {String} Name of the attribute group, e. g. `"physical"`. 
   */
  getAttributeGroupName(attributeName) {
    return getGroupForAttributeByName(attributeName).name;
  }

  /**
   * Returns true, if the given face/number represents a positive (= success).
   * 
   * @param {String | Number} face A die face to check whether it represents a positive (= success).
   * 
   * @returns {Boolean}
   * 
   * @throws {Error} Thrown, if the given face is outside the valid range of 0 (inclusive) to 6 (inclusive).
   */
  isPositive(face) {
    const int = parseInt(face);

    if (int < 0 || int > 6) throw new Error("Die face count out of range [0-6]");

    return int > 4;
  }

  /**
   * Returns true, if the given face/number represents a negative (= failure).
   * 
   * @param {String | Number} face A die face to check whether it represents a negative (= failure).
   * 
   * @returns {Boolean}
   * 
   * @throws {Error} Thrown, if the given face is outside the valid range of 0 (inclusive) to 6 (inclusive).
   */
  isNegative(face) {
    const int = parseInt(face);

    if (int < 0 || int > 6) throw new Error("Die face count out of range [0-6]");

    return int < 5;
  }

  /**
   * Returns true, if the given dice pool roll result should result in a spell-backfire. 
   * 
   * @param {DicePoolRollResult} rollResult 
   * 
   * @returns {Boolean}
   */
  rollCausesBackfire(rollResult) {
    if (rollResult.outcomeType.name === DICE_POOL_RESULT_TYPES.FAILURE.name) {
      return true;
    } else {
      return false;
    }
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

    if (type !== "pc" && type !== "npc") {
      throw new Error("Only PC and NPC type actors supported");
    }

    const injuryCount = (actor.items.filter(it => it.type === "injury")).length;
    const level = this.getEffectiveAttributeRawLevel(ATTRIBUTES.toughness, actor);

    return (parseInt(level) * 4) - (injuryCount * 2);
  }

  /**
   * Returns the maximum injury threshold of the given actor. 
   * 
   * @param {Actor} actor 
   * 
   * @returns {Number}
   * 
   * @throws {Error} Thrown, if the given actor is not of type `"pc"` or `"npc"`. 
   */
  getCharacterMaximumInjuries(actor) {
    const type = actor.type.toLowerCase();
    if (type !== "pc" && type !== "npc") {
      throw new Error("Only PC and NPC type actors supported");
    }

    const level = this.getEffectiveAttributeRawLevel(ATTRIBUTES.toughness, actor);

    return Math.max(parseInt(level), 1);
  }

  /**
   * Returns the maximum exhaustion threshold of the given actor. 
   * 
   * @param {Actor} actor 
   * 
   * @returns {Number}
   * 
   * @throws {Error} Thrown, if the given actor is not of type `"pc"` or `"npc"`. 
   */
  getCharacterMaximumExhaustion(actor) {
    const type = actor.type.toLowerCase();
    if (type !== "pc" && type !== "npc") {
      throw new Error("Only PC and NPC type actors supported");
    }
    
    const base = 1;
    const level = this.getEffectiveAttributeRawLevel(ATTRIBUTES.endurance, actor);

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
    if (type !== "pc" && type !== "npc") throw new Error("Only PC and NPC type actors allowed");

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
    if (type !== "pc" && type !== "npc") throw new Error("Only PC and NPC type actors allowed");

    const level = this.getEffectiveAttributeModifiedLevel(ATTRIBUTES.strength, actor);

    return Math.max(0, Math.floor((level - 1) / 3));
  }

  /**
   * Returns an object containing the maximum magic stamina, as well as the details of how it came to be. 
   * 
   * Not returning a `Sum` is intentional, because the total must deviate from the components' actual sum! 
   * 
   * @param {Actor} actor 
   * 
   * @returns {Number} The maximum magic stamina of the given actor. 
   * 
   * @throws {Error} Thrown, if the given actor is not of type `"pc"` or `"npc"`. 
   */
  getCharacterMaximumMagicStamina(actor) {
    const type = actor.type.toLowerCase();
    if (type !== "pc" && type !== "npc") throw new Error("Only PC and NPC type actors allowed");

    const arcanaLevel = this.getEffectiveAttributeModifiedLevel(ATTRIBUTES.arcana, actor) * 2;
    let total = arcanaLevel;
    
    const components = [
      new SumComponent(ATTRIBUTES.arcana.name, ATTRIBUTES.arcana.localizableName, arcanaLevel),
    ];

    const skills = actor.items.filter(it => it.type === "skill");
    for (const skill of skills) {
      const transientSkill = skill.getTransientObject();
      if (transientSkill.isMagicSchool !== true) continue;

      const skillLevel = this.getEffectiveSkillModifiedLevel(skill, actor);
      components.push(new SumComponent(transientSkill.name, transientSkill.localizableName, skillLevel));
      total += skillLevel;
    }

    return {
      total: total,
      components: components,
    };
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
   * Returns true, if the given actor must do toughness tests, whenever they suffer an injury. 
   * 
   * @param {Actor} actor 
   * 
   * @returns {Boolean} True, if any further injury requires a toughness test. 
   * 
   * @throws {Error} Thrown, if the given actor is not of type `"pc"` or `"npc"`. 
   */
  isToughnessTestRequired(actor) {
    const type = actor.type.toLowerCase();
    if (type !== "pc" && type !== "npc") throw new Error("Only PC and NPC type actors allowed");

    const maxInjuries = this.getCharacterMaximumInjuries(actor);
    const injuryCount = (actor.items.filter(it => it.type === "injury")).length;
    if (injuryCount > 0 && injuryCount >= Math.floor(maxInjuries / 2)) {
      return true;
    } else {
      return false;
    }
  }
  
  /**
   * Returns the effective raw level of the given actor for the given 
   * attribute. 
   * 
   * For NPCs, the effective level can be determined by a challenge 
   * rating, if one is active. For PCs, the raw attribute level 
   * is picked. 
   * 
   * @param {Attribute} attribute The attribute whose effective level 
   * is to be returned. 
   * @param {Actor} actor The actor whose attribute it is. 
   * 
   * @returns {Number} The raw level. 
   */
  getEffectiveAttributeRawLevel(attribute, actor) {
    const type = actor.type.toLowerCase();
    if (type !== "pc" && type !== "npc") {
      throw new Error("Only PC and NPC type actors supported");
    }

    const attributeGroup = getGroupForAttributeByName(attribute.name);
    
    if (type === "npc") {
      const transientNpc = actor.getTransientObject();
      if (transientNpc.getIsCrActiveFor(attributeGroup.name) === true) {
        return transientNpc.getCrFor(attributeGroup.name).value;
      }
    }
    
    const level = actor.system.attributes[attributeGroup.name][attribute.name].level;
    return level;
  }
  
  /**
   * Returns the effective modified level of the given actor for the 
   * given attribute. 
   * 
   * For NPCs, the effective level can be determined by a challenge 
   * rating, if one is active. For PCs, the raw attribute level 
   * is picked. 
   * 
   * @param {Attribute} attribute The attribute whose effective level 
   * is to be returned. 
   * @param {Actor} actor The actor whose attribute it is. 
   * 
   * @returns {Number} The modified level. 
   */
  getEffectiveAttributeModifiedLevel(attribute, actor) {
    const type = actor.type.toLowerCase();
    if (type !== "pc" && type !== "npc") {
      throw new Error("Only PC and NPC type actors supported");
    }

    const transientActor = actor.getTransientObject();
    
    if (type === "npc") {
      const attributeGroup = getGroupForAttributeByName(attribute.name);
      if (transientActor.getIsCrActiveFor(attributeGroup.name) === true) {
        return transientActor.getCrFor(attributeGroup.name).modified;
      }
    }
    
    const characterAttribute = transientActor.attributes.find(it => it.name === attribute.name);
    return characterAttribute.modifiedLevel;
  }

  /**
   * Returns the effective modified level of the given actor for the 
   * given skill. 
   * 
   * For NPCs, the effective level can be determined by a challenge 
   * rating, if one is active. For PCs, the raw skill level 
   * is picked. 
   * 
   * @param {Item | TransientSkill} skill The skill whose effective level 
   * is to be returned. 
   * @param {Actor} actor The actor whose skill it is. 
   * 
   * @returns {Number} The modified level. 
   */
  getEffectiveSkillModifiedLevel(skill, actor) {
    const transientSkill = skill.getTransientObject();

    if (actor.type === "npc") {
      const attributeGroup = getGroupForAttributeByName(transientSkill.activeBaseAttribute.name);
      const transientActor = actor.getTransientObject();

      if (transientActor.getIsCrActiveFor(attributeGroup.name) === true) {
        return transientActor.getCrFor(attributeGroup.name).modified;
      }
    }

    return transientSkill.modifiedLevel;
  }
}
