import LevelAdvancement from "./level-advancement.mjs";
import { ATTRIBUTE_GROUPS } from "./attribute/attribute-groups.mjs";
import { SummedData, SummedDataComponent } from "./summed-data.mjs";
import { SkillTier, SKILL_TIERS } from "./skill/skill-tier.mjs";
import { ATTRIBUTE_TIERS, AttributeTier } from "./attribute/attribute-tier.mjs";
import DicePoolResult from "../dice/dice-pool-result.mjs";
import { DiceOutcomeTypes } from "../dice/dice-outcome-types.mjs";

/**
 * Provides all the ruleset-specifics. 
 */
export default class Ruleset {
  /**
   * Returns the number of dice for a skill test. 
   * 
   * @param {Number} skillLevel A skill level. 
   * @param {Number} relatedAttributeLevel Level of the skill related attribute. 
   * 
   * @returns {Object} { totalDiceCount: {Number}, skillDiceCount: {Number}, attributeDiceCount: {Number} }
   */
  getSkillTestNumberOfDice(skillLevel, relatedAttributeLevel) {
    return {
      totalDiceCount: skillLevel + relatedAttributeLevel,
      skillDiceCount: skillLevel,
      attributeDiceCount: relatedAttributeLevel
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
    const attGroups = ATTRIBUTE_GROUPS;
    for (const attGroupName in attGroups) {
      for (const attName in attGroups[attGroupName].attributes) {
        if (attName == attributeName) {
          return attGroupName;
        }
      }
    }
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
   * @param {DicePoolResult} rollResult 
   * 
   * @returns {Boolean}
   */
  rollCausesBackfire(rollResult) {
    if (rollResult.outcomeType === DiceOutcomeTypes.FAILURE) {
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
    if (type !== "pc" && type !== "npc") throw new Error("Only PC and NPC type actors allowed");

    const injuryCount = (actor.items.filter(it => it.type === "injury")).length;
    const attributeToughness = actor.system.attributes.physical.toughness;
    return (attributeToughness.level * 4) - (injuryCount * 2);
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
    if (type !== "pc" && type !== "npc") throw new Error("Only PC and NPC type actors allowed");

    const attribute = actor.system.attributes.physical.toughness;
    return Math.max(attribute.level, 1);
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
    if (type !== "pc" && type !== "npc") throw new Error("Only PC and NPC type actors allowed");
    
    const attributeLevel = parseInt(actor.system.attributes.physical.endurance.level);
    const base = 1;
    return base + attributeLevel;
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

    const attributeLevel = parseInt(actor.system.attributes.physical.strength.modifiedLevel);
    return attributeLevel * 3;
  }

  /**
   * Returns the asset slot maximum bulk bonus, based on the given character's strength. 
   * 
   * @param {Actor} actor 
   * 
   * @returns {Number}
   */
  getAssetSlotBonus(actor) {
    const strengthLevel = parseInt(actor.system.attributes.physical.strength.modifiedLevel);
    return Math.max(0, Math.floor((strengthLevel - 1) / 3));
  }

  /**
   * Returns an object containing the maximum magic stamina, as well as the details of how it came to be. 
   * 
   * @param {Actor} actor 
   * 
   * @returns {SummedData} The maximum magic stamina of the given actor. 
   * 
   * @throws {Error} Thrown, if the given actor is not of type `"pc"` or `"npc"`. 
   */
  getCharacterMaximumMagicStamina(actor) {
    const type = actor.type.toLowerCase();
    if (type !== "pc" && type !== "npc") throw new Error("Only PC and NPC type actors allowed");

    const attributeArcana = actor.system.attributes.mental.arcana;
    let total = attributeArcana.modifiedLevel;
    const components = [];

    const skills = actor.items.filter(it => it.type === "skill");
    for (const skill of skills) {
      const transientSkill = skill.getTransientObject();
      if (transientSkill.isMagicSchool !== true) continue;

      const skillLevel = transientSkill.level;
      components.push(new SummedDataComponent(transientSkill.name, transientSkill.localizableName, skillLevel));
      total += skillLevel;
    }

    return new SummedData(parseInt(Math.ceil(total / 2)), components);
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
}
