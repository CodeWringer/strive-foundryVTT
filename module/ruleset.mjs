import { attributeGroups } from "./constants/attribute-groups.mjs";
import AdvancementRequirements from "./dto/advancement-requirement.mjs";
import { SummedData } from "./dto/summed-data.mjs";
import { SummedDataComponent } from "./dto/summed-data.mjs";

/**
 * Provides all the ruleset-specifics. 
 */
export default class Ruleset {
  /**
   * Returns the number of dice for a skill test. 
   * @param {Number} skillLevel A skill level. 
   * @param {Number} relatedAttributeLevel Level of the skill related attribute. 
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
   * @param {Number} level The level for which to get the advancement requirements. 
   * @returns {AdvancementRequirements}
   */
  getAttributeAdvancementRequirements(level = 0) {
    return new AdvancementRequirements({
      requiredSuccessses: (level === 0) ? undefined : (level + 1) * (level + 1) * 4,
      requiredFailures: (level === 0) ? undefined : (level + 1) * (level + 1) * 5
    });
  }

  /**
   * Returns the advancement requirements for the given level of a skill. 
   * @param {Number} level The level for which to get the advancement requirements. 
   * @returns {AdvancementRequirements}
   */
  getSkillAdvancementRequirements(level = 0) {
    return new AdvancementRequirements({
      requiredSuccessses: (level == 0) ? 10 : (level + 1) * level * 2,
      requiredFailures: (level == 0) ? 14 : (level + 1) * level * 3
    });
  }

  /**
   * Returns the name of the attribute group containing the given attribute. 
   * @param attributeName {String} Internal name of an attribute, e.g. 'arcana'. 
   * @returns {String} Name of the attribute group, e. g. 'physical'. 
   */
  getAttributeGroupName(attributeName) {
    const attGroups = attributeGroups;
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
   * @param {String|Number} face A die face to check whether it represents a positive (= success).
   * @returns {Boolean}
   */
  isPositive(face) {
    const int = parseInt(face);
    return int === 6 || int === 5;
  }

  /**
   * Returns true, if the given face/number represents a negative (= failure).
   * @param {String|Number} face A die face to check whether it represents a negative (= failure).
   * @returns {Boolean}
   */
  isNegative(face) {
    const int = parseInt(face);
    return int <= 4;
  }

  /**
   * Returns true, if the given face/number represents a spell-backfire-causing negative. 
   * @param {String|Number} face A die face to check whether it represents a spell-backfire-causing negative. 
   * @returns {Boolean}
   */
  causesBackfire(face) {
    const int = parseInt(face);
    return int === 1 || int === 2;
  }

  getCharacterMaximumHp(actor) {
    const businessData = actor.data.data;
    const injuryCount = actor.getInjuries().length;
    return (businessData.attributes.physical.toughness.value * 4) - (injuryCount * 2);
  }

  getCharacterMaximumInjuries(actor) {
    return Math.max(actor.data.data.attributes.physical.toughness.value, 1);
  }

  getCharacterMaximumExhaustion(actor) {
    return actor.data.data.attributes.physical.endurance.value * 3;
  }

  getCharacterMaximumInventory(actor) {
    return actor.data.data.attributes.physical.strength.value * 6;
  }

  /**
   * Returns an object containing the maximum magic stamina, as well as the details of how it came to be. 
   * @param {AmbersteelActor} actor 
   * @returns {SummedData} The maximum magic stamina of the given actor. 
   */
  getCharacterMaximumMagicStamina(actor) {
    let total = actor.data.data.attributes.mental.arcana.value;
    const components = [];

    for (const skill of actor.data.data.skills) {
      if (skill.data.data.isMagicSchool !== true) continue;

      const skillLevel = parseInt(skill.data.data.value);
      components.push(new SummedDataComponent(skill.name, skill.name, skillLevel));
      total += skillLevel;
    }

    return new SummedData(parseInt(Math.ceil(total / 2)), components);
  }

  /**
   * Returns the maximum number of fate cards that can be accrued on a character. 
   * @returns {Number} The maximum number of fate cards. 
   */
  getMaximumFateCards() {
    return 5;
  }

  /**
   * Returns true, if the given actor must do toughness tests, whenever they suffer an injury. 
   * @param actor 
   * @returns {Boolean} True, if any further injury requires a toughness test. 
   */
  isToughnessTestRequired(actor) {
    const businessData = actor.data.data;
    const maxInjuries = businessData.health.maxInjuries;
    const injuryCount = actor.getInjuries().length;
    if (injuryCount >= Math.ceil(maxInjuries / 2)) {
      return true;
    } else {
      return false;
    }
  }
}
