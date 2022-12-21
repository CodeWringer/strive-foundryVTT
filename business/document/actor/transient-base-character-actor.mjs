import { TEMPLATES } from '../../../presentation/template/templatePreloader.mjs';
import { DiceOutcomeTypes } from '../../dice/dice-outcome-types.mjs';
import { ATTRIBUTE_GROUPS } from '../../ruleset/attribute/attribute-groups.mjs';
import CharacterAttributeGroup from '../../ruleset/attribute/character-attribute-group.mjs';
import Ruleset from '../../ruleset/ruleset.mjs';
import * as PropUtil from '../../util/property-utility.mjs';
import TransientBaseActor from './transient-base-actor.mjs';

/**
 * Represents the base contract for a "specific" actor "sub-type" that 
 * represents a "character", in the way the Ambersteel rule set regards them. 
 * 
 * @extends TransientBaseActor
 * 
 * @property {Array<CharacterAttributeGroup>} attributeGroups The grouped attributes 
 * of the character. 
 * @property {Array<CharacterAttribute>} attributes The attributes of the character. 
 * @property {Object} skills
 * @property {Array<TransientSkill>} skills.all Returns **all** skills of the character. 
 * @property {Array<TransientSkill>} skills.learningSkills Returns all learning skills of the character. 
 * @property {Array<TransientSkill>} skills.knownSkills Returns all known skills of the character. 
 * @property {Object} health
 * @property {Array<TransientInjury>} health.injuries 
 * @property {Array<TransientIllness>} health.illnesss 
 * @property {Array<TransientMutation>} health.mutations 
 * @property {Number} health.HP 
 * @property {Number} health.maxHP 
 * @property {Number} health.maxInjuries 
 * @property {Number} health.exhaustion 
 * @property {Number} health.maxExhaustion 
 * @property {Number} health.magicStamina 
 * @property {Number} health.maxMagicStamina 
 * @property {Object} assets
 * @property {Array<TransientAsset>} assets.all 
 * @property {Array<TransientAsset>} assets.onPerson 
 * @property {Array<TransientAsset>} assets.remote 
 * @property {Number} assets.currentBulk
 * @property {Number} assets.maxBulk
 */
export default class TransientBaseCharacterActor extends TransientBaseActor {
  /** @override */
  get defaultImg() { return "icons/svg/mystery-man.svg"; }
  
  /** @override */
  get chatMessageTemplate() { return TEMPLATES.ACTOR_CHAT_MESSAGE; }

  /**
   * @param {Actor} document An encapsulated actor instance. 
   * 
   * @throws {Error} Thrown, if `document` is `undefined`. 
   */
  constructor(document) {
    super(document);

    this.attributeGroups = this._getAttributeGroups();
    this.attributes = this._getAttributes();

    const ruleset = new Ruleset();

    // Skills
    this.skills = {
      all: this.items.filter(it => it.type === "skill"),
      learningSkills: this.items.filter(it => it.type === "skill" && it.level < 1),
      knownSkills: this.items.filter(it => it.type === "skill" && it.level > 0),
    };

    // Health
    this.health = {
      injuries: this.items.filter(it => it.type === "injury"),
      illnesss: this.items.filter(it => it.type === "illness"),
      mutations: this.items.filter(it => it.type === "mutation"),
      HP: this.document.data.data.health.HP,
      maxHP: ruleset.getCharacterMaximumHp(document),
      maxInjuries: ruleset.getCharacterMaximumInjuries(document),
      exhaustion: this.document.data.data.health.exhaustion,
      maxExhaustion: ruleset.getCharacterMaximumExhaustion(document),
      magicStamina: this.document.data.data.health.magicStamina,
      maxMagicStamina: ruleset.getCharacterMaximumMagicStamina(document),
    };

    // Assets
    const assets = this.items.filter(it => it.type === "item");
    const assetsOnPerson = assets.filter(it => it.isOnPerson === true);
    
    let currentBulk = 0;
    for (const assetOnPerson of assetsOnPerson) {
      currentBulk += assetOnPerson.bulk;
    }

    this.assets = {
      all: assets,
      onPerson: assetsOnPerson,
      remote: assets.filter(it => it.isOnPerson !== true),
      currentBulk: currentBulk,
      maxBulk: ruleset.getCharacterMaximumInventory(document),
    };
  }

  /**
   * Returns the grouped attributes of the character. 
   * 
   * @returns {Array<CharacterAttributeGroup>}
   * 
   * @private
   */
  _getAttributeGroups() {
    const result = [];

    for (const groupDefName in ATTRIBUTE_GROUPS) {
      const groupDef = ATTRIBUTE_GROUPS[groupDefName];
      // Skip any convenience members, such as `asChoices`.
      if (groupDef.name === undefined) continue;

      result.push(new CharacterAttributeGroup(this.document, groupDef.name));
    }

    return result;
  }
  
  /**
   * Returns the attributes of the character. 
   * 
   * @returns {Array<CharacterAttribute>}
   * 
   * @private
   */
  _getAttributes() {
    return this._getAttributeGroups().map(it => it.attributes);
  }

  /**
   * Advances the skill, based on the given {DicePoolResult}. 
   * 
   * @param {DicePoolResult} rollResult 
   * @param {String} itemId The id of the skill item to advance. 
   * 
   * @async
   */
  async advanceSkillBasedOnRollResult(rollResult, itemId) {
    const oSkill = this.skills.find(it => it.id === itemId);
    oSkill.addProgress(rollResult.outcomeType, true);
  }

  /**
   * Attribute roll handler.
   *  
   * @param {DicePoolResult} rollResult 
   * @param {String} attributeName The name of the attribute. 
   * 
   * @async
   */
  async advanceAttributeBasedOnRollResult(rollResult, attributeName) {
    if (rollResult === undefined) {
      game.ambersteel.logger.logWarn("rollResult is undefined");
      return;
    }
    await this.addAttributeProgress(rollResult.outcomeType, attributeName);
  }

  /**
   * Sets the level of the attribute with the given name. 
   * 
   * @param {String} attName Internal name of an attribute, e.g. `"magicSense"`. 
   * @param {Number | undefined} newValue Value to set the attribute to, e.g. `4`. 
   * * Default `0`
   * @param {Boolean | undefined} resetProgress If true, will also reset successes and failures. 
   * * Default `true`
   * 
   * @async
   */
  async setAttributeLevel(attName, newValue = 0, resetProgress = true) {
    const groupName = new Ruleset().getAttributeGroupName(attName);
    const propertyPath = `data.attributes.${groupName}.${attName}`;

    if (resetProgress === true) {
      await this.document.update({
        [`${propertyPath}.level`]: newValue,
        [`${propertyPath}.successes`]: 0,
        [`${propertyPath}.failures`]: 0
      });
    } else {
      await this.document.update({
        [`${propertyPath}.level`]: newValue,
      });
    }
  }

  /**
   * Adds success/failure progress to an attribute. 
   * 
   * Also auto-levels up the attribute, if 'autoLevel' is set to true. 
   * 
   * @param {DiceOutcomeTypes} outcomeType The test outcome to work with. 
   * @param {String | undefined} attName Optional. Internal name of an attribute, e.g. 'magicSense'. 
   * @param {Boolean | undefined} autoLevel Optional. If true, will auto-level up. Default false
   * @param {Boolean | undefined} resetProgress Optional. If true, will also reset 
   * successes and failures, if `autoLevel` is also true and a level automatically 
   * incremented. 
   * * Default `true`
   * 
   * @throws {Error} Thrown, if `outcomeType` is undefined. 
   * 
   * @async
   */
  async addAttributeProgress(outcomeType, attName = undefined, autoLevel = false, resetProgress = true) {
    if (outcomeType === undefined) {
      game.ambersteel.logger.logWarn("outcomeType is undefined");
      return;
    }

    const attribute = this.attributes.find(it => it.name === attName);

    if (outcomeType === DiceOutcomeTypes.SUCCESS) {
      attribute.advancementProgress.successes++;
    } else {
      attribute.advancementProgress.failures++;
    }

    if (autoLevel === true) {
      if (attribute.advancementProgress.successes >= attribute.advancementRequirements.successes
        && attribute.advancementProgress.failures >= attribute.advancementRequirements.failures) {
        attribute.level++;

        if (resetProgress === true) {
          attribute.advancementProgress.successes = 0;
          attribute.advancementProgress.failures = 0;
        }
      }
    }

    const groupName = new Ruleset().getAttributeGroupName(attName);
    const propertyPath = `data.attributes.${groupName}.${attName}`;

    await this.document.update({
      [`${propertyPath}.level`]: attribute.level,
      [`${propertyPath}.successes`]: attribute.advancementProgress.successes,
      [`${propertyPath}.failures`]: attribute.advancementProgress.failures
    });
  }

  /**
   * Returns the property values identified by the `@`-denoted references in the given string, 
   * from this `Actor`. 
   * 
   * Searches: 
   * * Attribute names.
   * * Embedded skill name.
   * * Embedded skill ability name.
   * * Embedded asset name.
   * * Embedded injury name.
   * * Embedded illness name.
   * * Embedded mutation name.
   * * Embedded asset name.
   * * Embedded fate-card name.
   * 
   * @param {String} str A string containing `@`-denoted references. 
   * * E. g. `"@strength"` or localized and capitalized `"@Stärke"`. 
   * * Abbreviated attribute names are permitted, e. g. `"@wis"` instead of `"@wisdom"`. 
   * * If a reference's name contains spaces, they must be replaced with underscores. 
   * E. g. `"@Heavy_Armor"`, instead of `"@Heavy Armor"`
   * * *Can* contain property paths! These paths are considered relative to the data-property. 
   * E. g. `@a_fate_card.cost.miFP`, instead of `@a_fate_card.data.data.cost.miFP`. 
   * 
   * @returns {Map<String, Any | undefined>} A map of the reference key, including the `@`-symbol, to its resolved reference. 
   * * Only contains unique entries. No reference is included more than once. 
   */
  resolveReferences(str) {
    const result = new Map();

    const references = str.match(/@[^\s-/*+]+/g);
    if (references === undefined || references === null) {
      return result;
    }

    // Iterates the given documents array and returns the first element, 
    // whose name matches the given name. Case-insensitive comparison. 
    // No regard for localization! 
    const _getMatchingDocument = (documents, name) => {
      for (const document of documents) {
        if (document.name.toLowerCase() == name) {
          return document;
        }
      }
      return undefined;
    }

    for (const reference of references) {
      const propertyPathMatch = reference.match(/\.[^\s-/*+]+/i);
      const propertyPath = propertyPathMatch == null ? undefined : propertyPathMatch[0].substring(1); // The property path, excluding the first dot. 
      
      const lowercaseReference = reference.toLowerCase();
      const comparableReference = (propertyPath !== undefined ? lowercaseReference.substring(1, lowercaseReference.indexOf(".", 1)): lowercaseReference.substring(1)).replaceAll("_", " ");
      if (result.has(comparableReference)) {
        // Only bother looking up a reference once. 
        continue;
      }

      // Search attributes. 
      let attribute = this.attributes.find(it => it.name === comparableReference);
      if (attribute === undefined) {
        attribute = this.attributes.find(it => game.i18n.localize(it.localizableName).toLowerCase());
      }
      if (attribute !== undefined) {
        result.set(lowercaseReference, attribute);
        continue;
      }

      // Search skill. 
      let matchFound = false;
      for (const skill of this.skills.all) {
        if (skill.name.toLowerCase() == comparableReference) {
          result.set(lowercaseReference, (propertyPath !== undefined) ? PropUtil.getNestedPropertyValue(skill.document.data, propertyPath) : skill);
          matchFound = true;
          break;
        }

        // Search skill ability.
        for (const ability of skill.abilities) {
          if (ability.name.toLowerCase() == comparableReference) {
            result.set(lowercaseReference, (propertyPath !== undefined) ? PropUtil.getNestedPropertyValue(ability, propertyPath) : ability);
            matchFound = true;
            break;
          }
        }
        if (matchFound) break;
      }
      if (matchFound) continue;

      // Search asset.
      const asset = _getMatchingDocument(this.assets.all, comparableReference);
      if (asset !== undefined) {
        result.set(lowercaseReference, propertyPath !== undefined ? PropUtil.getNestedPropertyValue(asset.document.data, propertyPath) : asset);
        continue;
      }
      
      // Search injury.
      const injury = _getMatchingDocument(this.health.injuries, comparableReference);
      if (injury !== undefined) {
        result.set(lowercaseReference, propertyPath !== undefined ? PropUtil.getNestedPropertyValue(injury.document.data, propertyPath) : injury);
        continue;
      }
      
      // Search illness.
      const illness = _getMatchingDocument(this.health.illnesses, comparableReference);
      if (illness !== undefined) {
        result.set(lowercaseReference, propertyPath !== undefined ? PropUtil.getNestedPropertyValue(illness.document.data, propertyPath) : illness);
        continue;
      }
      
      // Search mutation.
      const mutation = _getMatchingDocument(this.health.mutations, comparableReference);
      if (mutation !== undefined) {
        result.set(lowercaseReference, propertyPath !== undefined ? PropUtil.getNestedPropertyValue(mutation.document.data, propertyPath) : mutation);
        continue;
      }
      
      // TODO #85: This really belongs on the `TransientPc` type, instead of here. 
      // Search fate-card.
      if (this.fateCards !== undefined) {
        const fateCard = _getMatchingDocument(this.fateCards, comparableReference);
        if (fateCard !== undefined) {
          result.set(lowercaseReference, propertyPath !== undefined ? PropUtil.getNestedPropertyValue(fateCard.document.data, propertyPath) : fateCard);
          continue;
        }
      }
    }

    return result;
  }
}
