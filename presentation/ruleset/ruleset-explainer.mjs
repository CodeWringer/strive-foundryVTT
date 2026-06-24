import { StringUtil } from "../../common/util/string-utility.mjs"
import { GameSystemActor } from "../../business/model/document/actor/actor.mjs"
import TransientBaseCharacterActor from "../../business/model/document/actor/transient-character-actor.mjs"
import Ruleset from "../../business/model/domain/ruleset.mjs"
import { CharacterAttribute } from "../../business/model/_module.mjs"
import { ITEM_TYPES } from "../../business/model/domain/const/item-types.mjs"
import { TransientSkill } from "../../business/model/document/_module.mjs"
import { ATTRIBUTES } from "../../business/model/domain/const/attributes.mjs"

/**
 * Provides strings that explain derived values, based on the ruleset. 
 */
export default class RulesetExplainer {
  /**
   * @type {Ruleset}
   * @readonly
   * @private
   */
  _ruleset = new Ruleset();

  /**
   * @param {GameSystemActor | TransientBaseCharacterActor} actor 
   * 
   * @returns {String}
   */
  getExplanationForBaseInitiative(actor) {
    const transientActor = actor.getTransientObject();
    const characterAgility = transientActor.attributes.find(it => it.name === ATTRIBUTES.agility.name);
    const characterAwareness = transientActor.attributes.find(it => it.name === ATTRIBUTES.awareness.name);
    const characterWit = transientActor.attributes.find(it => it.name === ATTRIBUTES.wit.name);
    return StringUtil.format2(
      game.i18n.localize("system.rules.baseInitiative"),
      {
        localizedAgility: game.i18n.localize(ATTRIBUTES.agility.localizableName),
        agility: characterAgility.modifiedLevel,
        localizedAwareness: game.i18n.localize(ATTRIBUTES.awareness.localizableName),
        awareness: characterAwareness.modifiedLevel,
        localizedWit: game.i18n.localize(ATTRIBUTES.wit.localizableName),
        wit: characterWit.modifiedLevel,
        baseInitiative: transientActor.baseInitiative,
      }
    );
  }

  /**
   * @param {GameSystemActor | TransientBaseCharacterActor} actor 
   * 
   * @returns {String}
   */
  getExplanationForSprintingSpeed(actor) {
    const transientActor = actor.getTransientObject();
    const characterAgility = transientActor.attributes.find(it => it.name === ATTRIBUTES.agility.name);
    const characterToughness = transientActor.attributes.find(it => it.name === ATTRIBUTES.toughness.name);
    return StringUtil.format2(
      game.i18n.localize("system.rules.sprintingSpeed"),
      {
        localizedAgility: game.i18n.localize(ATTRIBUTES.agility.localizableName),
        agility: characterAgility.modifiedLevel,
        localizedToughness: game.i18n.localize(ATTRIBUTES.toughness.localizableName),
        toughness: characterToughness.modifiedLevel,
        sprintingSpeed: transientActor.sprintingSpeed,
      }
    );
  }

  /**
   * @param {GameSystemActor | TransientBaseCharacterActor} actor 
   * 
   * @returns {String}
   */
  getExplanationForStability(actor) {
    const transientActor = actor.getTransientObject();
    const characterStrength = transientActor.attributes.find(it => it.name === ATTRIBUTES.strength.name);
    const characterToughness = transientActor.attributes.find(it => it.name === ATTRIBUTES.toughness.name);
    return StringUtil.format2(
      game.i18n.localize("system.rules.stability"),
      {
        localizedStrength: game.i18n.localize(ATTRIBUTES.strength.localizableName),
        strength: characterStrength.modifiedLevel,
        localizedToughness: game.i18n.localize(ATTRIBUTES.toughness.localizableName),
        toughness: characterToughness.modifiedLevel,
        stability: transientActor.stability,
      }
    );
  }

  /**
   * @param {CharacterAttribute} attribute 
   * 
   * @returns {String}
   */
  getExplanationForAttributeAdvancement(attribute) {
    return StringUtil.format2(game.i18n.localize("system.character.advancement.experiencePoint.requiredForAdvancement"), {
      xp: new Ruleset().getAttributeAdvancementRequirements(attribute),
      type: game.i18n.localize(`system.character.attribute.type.${attribute.type.name}`),
    });
  }

  /**
   * @param {TransientSkill} skill 
   * 
   * @returns {String}
   */
  getExplanationForSkillAdvancement(skill) {
    if (skill.level === 0) {
      return game.i18n.localize("system.character.advancement.requirement.explanation.learningSkill");
    } else {
      return StringUtil.format2(game.i18n.localize("system.character.advancement.requirement.explanation.knownSkill"), {
        level: skill.level,
        result: new Ruleset().getSkillAdvancementRequirements(skill.level),
      });
    }
  }

  /**
   * @param {GameSystemActor | TransientBaseCharacterActor} actor 
   * 
   * @returns {String}
   */
  getExplanationForMaxHp(actor) {
    const transientActor = actor.getTransientObject();

    const baseHp = this._ruleset.getCharacterBaseHp();
    const toughnessLevel = parseInt(this._ruleset.getEffectiveAttributeRawLevel(ATTRIBUTES.toughness, transientActor));
    const hpReductionPerInjury = this._ruleset.getMaximumHpReductionPerInjury(actor);
    const unmodifiedHp = this._ruleset.getUnmodifiedMaximumHp(actor);
    const injuryCount = (actor.items.filter(it => it.type === ITEM_TYPES.injury)).length;
    return StringUtil.format2(
      game.i18n.localize("system.character.health.hp.maxExplanation"),
      {
        baseHp: baseHp,
        toughness: toughnessLevel,
        hpPerLevel: this._ruleset.hpPerLevel,
        unmodifiedHp: unmodifiedHp,
        hpReductionPerInjury: hpReductionPerInjury,
        injuryCount: injuryCount,
        finalMaxHp: transientActor.health.modifiedMaxHp,
        operand: transientActor.health.maxHpModifier >= 0 ? "+" : "-",
        modifier: Math.abs(transientActor.health.maxHpModifier),
      }
    );
  }
  
  /**
   * @param {TransientBaseCharacterActor} actor 
   * 
   * @returns {String}
   */
  getExplanationForMaxExhaustion(actor) {
    const transientActor = actor.getTransientObject();

    const rawLevel = this._ruleset.getEffectiveAttributeRawLevel(ATTRIBUTES.toughness, actor);
    return StringUtil.format2(
      game.i18n.localize("system.character.health.exhaustion.maxExplanation"),
      {
        baseExhaustionLimit: 1,
        toughnessRawLevel: rawLevel,
        maxExhaustion: transientActor.health.modifiedMaxExhaustion,
        operand: transientActor.health.maxExhaustionModifier >= 0 ? "+" : "-",
        modifier: Math.abs(transientActor.health.maxExhaustionModifier),
      }
    );
  }
  
  /**
   * @param {TransientBaseCharacterActor} actor 
   * 
   * @returns {String}
   */
  getExplanationForMaxLuggage(actor) {
    const level = this._ruleset.getEffectiveAttributeModifiedLevel(ATTRIBUTES.strength, actor);
    return StringUtil.format2(
      game.i18n.localize("system.rules.maxLuggage"),
      {
        localizedStrength: game.i18n.localize(ATTRIBUTES.strength.localizableName),
        strength: level,
        maxLuggage: actor.assets.maxBulk,
      }
    );
  }
  
}
