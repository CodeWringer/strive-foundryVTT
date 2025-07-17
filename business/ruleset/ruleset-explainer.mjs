import { GameSystemActor } from "../document/actor/actor.mjs";
import TransientBaseCharacterActor from "../document/actor/transient-base-character-actor.mjs";
import { ITEM_TYPES } from "../document/item/item-types.mjs";
import TransientSkill from "../document/item/skill/transient-skill.mjs";
import { StringUtil } from "../util/string-utility.mjs";
import CharacterAssetSlotGroup from "./asset/character-asset-slot-group.mjs";
import { ATTRIBUTE_TIERS } from "./attribute/attribute-tier.mjs";
import { ATTRIBUTES } from "./attribute/attributes.mjs";
import CharacterAttribute from "./attribute/character-attribute.mjs";
import Ruleset from "./ruleset.mjs";
import { SKILL_TIERS } from "./skill/skill-tier.mjs";

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
   * @param {CharacterAttribute} attribute 
   * 
   * @returns {String}
   */
  getExplanationForAttributeAdvancement(attribute) {
    const tier = this._ruleset.getAttributeLevelTier(attribute.level);
    let factor;
    if (tier.name === ATTRIBUTE_TIERS.underdeveloped.name) {
      factor = 10;
    } else if (tier.name === ATTRIBUTE_TIERS.average.name) {
      factor = 7;
    } else if (tier.name === ATTRIBUTE_TIERS.exceptional.name) {
      factor = 8;
    }
    return StringUtil.format2(
      game.i18n.localize("system.rules.attributeAdvancementRequirements"),
      {
        rawLevel: attribute.level,
        factor: factor,
        attributeTier: game.i18n.localize(tier.localizableName),
        advancementRequirements: attribute.advancementRequirements,
      }
    );
  }

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
   * @param {TransientSkill} skill 
   * 
   * @returns {String}
   */
  getExplanationForSkillAdvancementRequirements(skill) {
    const tier = this._ruleset.getSkillLevelTier(skill.level);
    let successFormula;
    let failureFormula;
    if (tier.name === SKILL_TIERS.dabbling.name) {
      successFormula = "6";
      failureFormula = "9";
    } else if (tier.name === SKILL_TIERS.apprentice.name) {
      successFormula = `${game.i18n.localize("system.character.advancement.rawLevel")} (${skill.level}) + 3`;
      failureFormula = `(${game.i18n.localize("system.character.advancement.rawLevel")} (${skill.level}) * 2) + 4`;
    } else if (tier.name === SKILL_TIERS.master.name) {
      successFormula = `${game.i18n.localize("system.character.advancement.rawLevel")} (${skill.level}) + 4`;
      failureFormula = `(${game.i18n.localize("system.character.advancement.rawLevel")} (${skill.level}) * 2) + 5`;
    }
    return StringUtil.format2(
      game.i18n.localize("system.rules.skillAdvancementRequirements"),
      {
        tierName: game.i18n.localize(tier.localizableName),
        successFormula: successFormula,
        requiredSuccesses: skill.advancementRequirements.successes,
        failureFormula: failureFormula,
        requiredFailures: skill.advancementRequirements.failures,
      },
    );
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
    const injuryCount = (actor.items.filter(it => it.type === ITEM_TYPES.INJURY)).length;
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
   * @param {CharacterAssetSlotGroup} group 
   * 
   * @returns {String}
   */
  getExplanationForAssetSlotGroupBulk(group) {
    
    return StringUtil.format2(
      game.i18n.localize("system.rules.assetSlotGroupBulk"),
      {
        // TODO
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
