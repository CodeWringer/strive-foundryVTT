import LevelAdvancement from "./level-advancement.mjs";
import { ATTRIBUTE_GROUPS } from "./attribute/attribute-groups.mjs";
import { SummedData, SummedDataComponent } from "./skill/summed-data.mjs";

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
   * Returns the advancement requirements for the given level of an attribute. 
   * 
   * If level is equal to 0, will return undefined, instead of actual values. 
   * This is deliberate, as an attribute at level 0 cannot be advanced (naturally).
   * 
   * @param {Number} level The level for which to get the advancement requirements. 
   * 
   * @returns {LevelAdvancement}
   */
  getAttributeAdvancementRequirements(level = 0) {
    return new LevelAdvancement({
      successses: (level === 0) ? undefined : (level + 1) * (level + 1) * 4,
      failures: (level === 0) ? undefined : (level + 1) * (level + 1) * 5
    });
  }

  /**
   * Returns the advancement requirements for the given level of a skill. 
   * 
   * @param {Number} level The level for which to get the advancement requirements. 
   * 
   * @returns {LevelAdvancement}
   */
  getSkillAdvancementRequirements(level = 0) {
    return new LevelAdvancement({
      successses: (level == 0) ? 10 : (level + 1) * level * 2,
      failures: (level == 0) ? 14 : (level + 1) * level * 3
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
   * Returns true, if the given face/number represents a spell-backfire-causing negative. 
   * 
   * @param {String|Number} face A die face to check whether it represents a spell-backfire-causing negative. 
   * 
   * @returns {Boolean}
   * 
   * @throws {Error} Thrown, if the given face is outside the valid range of 0 (inclusive) to 6 (inclusive).
   */
  causesBackfire(face) {
    const int = parseInt(face);

    if (int < 0 || int > 6) throw new Error("Die face count out of range [0-6]");

    return int < 3;
  }

  /**
   * Returns the *current* maximum HP of the given actor. 
   * 
   * @param {TransientBaseCharacterActor} actor 
   * 
   * @returns {Number}
   * 
   * @throws {Error} Thrown, if the given actor is not of type `"pc"` or `"npc"`. 
   */
  getCharacterMaximumHp(actor) {
    const type = actor.type.toLowerCase();
    if (type !== "pc" && type !== "npc") throw new Error("Only PC and NPC type actors allowed");

    const injuryCount = actor.health.injuries.length;
    const attributeToughness = actor.attributes.find(it => it.name === "toughness");
    return (attributeToughness.level * 4) - (injuryCount * 2);
  }

  /**
   * Returns the maximum injury threshold of the given actor. 
   * 
   * @param {TransientBaseCharacterActor} actor 
   * 
   * @returns {Number}
   * 
   * @throws {Error} Thrown, if the given actor is not of type `"pc"` or `"npc"`. 
   */
  getCharacterMaximumInjuries(actor) {
    const type = actor.type.toLowerCase();
    if (type !== "pc" && type !== "npc") throw new Error("Only PC and NPC type actors allowed");

    const attributeToughness = actor.attributes.find(it => it.name === "toughness");
    return Math.max(attributeToughness.level, 1);
  }

  /**
   * Returns the maximum exhaustion threshold of the given actor. 
   * 
   * @param {TransientBaseCharacterActor} actor 
   * 
   * @returns {Number}
   * 
   * @throws {Error} Thrown, if the given actor is not of type `"pc"` or `"npc"`. 
   */
  getCharacterMaximumExhaustion(actor) {
    const type = actor.type.toLowerCase();
    if (type !== "pc" && type !== "npc") throw new Error("Only PC and NPC type actors allowed");
    
    const attributeEndurance = actor.attributes.find(it => it.name === "endurance");
    return 1 + (attributeEndurance.level * 1);
  }
  
  /**
   * Returns the maximum inventory slot size of the given actor. 
   * 
   * @param {TransientBaseCharacterActor} actor 
   * 
   * @returns {Number}
   * 
   * @throws {Error} Thrown, if the given actor is not of type `"pc"` or `"npc"`. 
   */
  getCharacterMaximumInventory(actor) {
    const type = actor.type.toLowerCase();
    if (type !== "pc" && type !== "npc") throw new Error("Only PC and NPC type actors allowed");

    const attributeStrength = actor.attributes.find(it => it.name === "strength");
    return attributeStrength.level * 6;
  }

  /**
   * Returns an object containing the maximum magic stamina, as well as the details of how it came to be. 
   * 
   * @param {TransientBaseCharacterActor} actor 
   * 
   * @returns {SummedData} The maximum magic stamina of the given actor. 
   * 
   * @throws {Error} Thrown, if the given actor is not of type `"pc"` or `"npc"`. 
   */
  getCharacterMaximumMagicStamina(actor) {
    const type = actor.type.toLowerCase();
    if (type !== "pc" && type !== "npc") throw new Error("Only PC and NPC type actors allowed");

    const attributeArcana = actor.attributes.find(it => it.name === "arcana");
    let total = attributeArcana.level;
    const components = [];

    for (const skill of actor.skills.all) {
      if (skill.isMagicSchool !== true) continue;

      components.push(new SummedDataComponent(skill.name, skill.localizableName, skill.level));
      total += skill.level;
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
   * @param actor 
   * 
   * @returns {Boolean} True, if any further injury requires a toughness test. 
   * 
   * @throws {Error} Thrown, if the given actor is not of type `"pc"` or `"npc"`. 
   */
  isToughnessTestRequired(actor) {
    const type = actor.type.toLowerCase();
    if (type !== "pc" && type !== "npc") throw new Error("Only PC and NPC type actors allowed");

    const maxInjuries = actor.health.maxInjuries;
    const injuryCount = actor.health.injuries.length;
    if (injuryCount > 0 && injuryCount >= Math.floor(maxInjuries / 2)) {
      return true;
    } else {
      return false;
    }
  }
}
