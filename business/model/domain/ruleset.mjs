import { ValidationUtil } from "../../../common/util/validation-utility.mjs";
import { ITEM_TYPES } from "./const/item-types.mjs";
import { ATTRIBUTE_TYPES } from "./const/attribute-types.mjs";
import { ACTOR_TYPES } from "./const/actor-types.mjs";
import { Attribute, ATTRIBUTES } from "./const/attributes.mjs";
import CharacterAttribute from "./attribute/character-attribute.mjs";
// Do not import TransientBaseCharacterActor, TransientSkill

/**
 * Provides all the ruleset-specifics. 
 */
export default class Ruleset {

  /**
   * Returns the *current* maximum HP of the given actor. 
   * 
   * @param {TransientBaseCharacterActor} character 
   * @returns {Number}
   * @static
   */
  static getCharacterMaximumHp(character) {
    // TODO
    // const unmodifiedHp = this.getUnmodifiedMaximumHp(actor);
    // const hpReduction = this.getCharacterMaximumHpReduction(actor);

    // return Math.max(this.getCharacterBaseHp(), (unmodifiedHp - hpReduction));
  }

  /**
   * Returns the maximum stamina of the given actor. 
   * 
   * @param {TransientBaseCharacterActor} character 
   * @returns {Number}
   * @static
   */
  static getCharacterMaximumStamina(character) {
    // TODO
    // const base = 1;
    // const level = this.getEffectiveAttributeRawLevel(ATTRIBUTES.toughness, actor);

    // return base + parseInt(level);
  }

  /**
   * @returns {Number}
   * @static
   */
  static getCharacterMaximumDeathSaves() {
    return 3;
  }

  /**
   * @param {TransientBaseCharacterActor} character 
   * @returns {Number}
   * @static
   */
  static getCharacterMaximumBulk(character) {
    const strAttr = character.attributes.find(it => it.name === ATTRIBUTES.strength.name);
    return strAttr.level * 3;
  }

  /**
   * Returns the advancement requirements for the given level of an attribute. 
   * 
   * @param {CharacterAttribute} attribute
   * 
   * @returns {Number}
   */
  getAttributeAdvancementRequirements(attribute) {
    const base = 20;

    if (attribute.type.name === ATTRIBUTE_TYPES.core.name || attribute.type.name === ATTRIBUTE_TYPES.favored.name) {
      const level = Math.max(1, attribute.level - 1);
      return base + (level * level);
    } else if (attribute.type.name === ATTRIBUTE_TYPES.penalized.name) {
      return Math.round((base + (attribute.level * attribute.level)) * 1.5);
    } else {
      return base + (attribute.level * attribute.level);
    }
  }

  /**
   * Returns the advancement requirements for the given level of a skill. 
   * 
   * @param {Number} level The level for which to get the advancement requirements. 
   * 
   * @returns {Number}
   */
  getSkillAdvancementRequirements(level = 0) {
    if (level === 0) {
      return 15;
    } else {
      const base = 8;
      return base + (level * 3);
    }
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
   * Returns the maximum HP reduction per injury. 
   * 
   * @returns {Number}
   */
  getMaximumHpReductionPerInjury() {
    return 10;
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
    if (type !== ACTOR_TYPES.character) {
      throw new Error("Only PC and NPC type actors supported");
    }

    const injuryCount = (actor.items.filter(it => it.type === ITEM_TYPES.injury)).length;
    const hpReductionPerInjury = this.getMaximumHpReductionPerInjury(actor);

    return injuryCount * hpReductionPerInjury;
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
    if (type !== ACTOR_TYPES.character) throw new Error("Only PC and NPC type actors allowed");

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
    if (type !== ACTOR_TYPES.character) throw new Error("Only PC and NPC type actors allowed");

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
    if (type !== ACTOR_TYPES.character) {
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
    if (type !== ACTOR_TYPES.character) {
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
    if (type !== ACTOR_TYPES.character) {
      throw new Error("Only PC and NPC type actors supported");
    }

    const transientSkill = skill.getTransientObject();
    return transientSkill.modifiedLevel;
  }
}
