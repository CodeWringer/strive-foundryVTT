import { TEMPLATES } from '../../../presentation/template/templatePreloader.mjs';
import { DiceOutcomeTypes } from '../../dice/dice-outcome-types.mjs';
import { ATTRIBUTE_GROUPS } from '../../ruleset/attribute/attribute-groups.mjs';
import CharacterAttributeGroup from '../../ruleset/attribute/character-attribute-group.mjs';
import Ruleset from '../../ruleset/ruleset.mjs';
import TransientBaseActor from './transient-base-actor.mjs';

/**
 * Represents the base contract for a "specific" actor "sub-type" that 
 * represents a "character", in the way the Ambersteel rule set regards them. 
 * 
 * @extends TransientBaseActor
 * 
 * @property {Array<CharacterAttributeGroup>} attributeGroups The grouped attributes 
 * of the character. 
 * * Read-only. 
 * @property {Array<CharacterAttribute>} attributes The attributes of the character. 
 * * Read-only. 
 * @property {Object} person
 * * Read-only. 
 * @property {Number} person.age
 * @property {String} person.species
 * @property {String} person.culture
 * @property {String} person.sex
 * @property {String} person.appearance
 * @property {String} person.biography
 * @property {Object} skills
 * * Read-only. 
 * @property {Array<TransientSkill>} skills.all Returns **all** skills of the character. 
 * * Read-only. 
 * @property {Array<TransientSkill>} skills.learning Returns all learning skills of the character. 
 * * Read-only. 
 * @property {Array<TransientSkill>} skills.known Returns all known skills of the character. 
 * * Read-only. 
 * @property {Object} health
 * * Read-only. 
 * @property {Array<TransientInjury>} health.injuries 
 * * Read-only. 
 * @property {Array<TransientIllness>} health.illnesss 
 * * Read-only. 
 * @property {Array<TransientMutation>} health.mutations 
 * * Read-only. 
 * @property {Number} health.HP 
 * @property {Number} health.maxHP 
 * * Read-only. 
 * @property {Number} health.maxInjuries 
 * * Read-only. 
 * @property {Number} health.exhaustion 
 * @property {Number} health.maxExhaustion 
 * * Read-only. 
 * @property {Number} health.magicStamina 
 * @property {Number} health.maxMagicStamina 
 * * Read-only. 
 * @property {Object} assets
 * * Read-only. 
 * @property {Array<TransientAsset>} assets.all 
 * * Read-only. 
 * @property {Array<TransientAsset>} assets.onPerson 
 * * Read-only. 
 * @property {Array<TransientAsset>} assets.remote 
 * * Read-only. 
 * @property {Number} assets.currentBulk
 * * Read-only. 
 * @property {Number} assets.maxBulk
 * * Read-only. 
 * @property {Any} assets.grid
 * @property {Any} assets.gridIndices
 */
export default class TransientBaseCharacterActor extends TransientBaseActor {
  /** @override */
  get defaultImg() { return "icons/svg/mystery-man.svg"; }
  
  /** @override */
  get chatMessageTemplate() { return TEMPLATES.ACTOR_CHAT_MESSAGE; }

  /**
   * @type {Object}
   */
  get person() {
    const thiz = this;
    return {
      get age() { return parseInt(thiz.document.data.data.person.age); },
      set age(value) { thiz.updateSingle("data.data.person.age", value); },

      get species() { return thiz.document.data.data.person.species; },
      set species(value) { thiz.updateSingle("data.data.person.species", value); },

      get culture() { return thiz.document.data.data.person.culture; },
      set culture(value) { thiz.updateSingle("data.data.person.culture", value); },

      get sex() { return thiz.document.data.data.person.sex; },
      set sex(value) { thiz.updateSingle("data.data.person.sex", value); },

      get appearance() { return thiz.document.data.data.person.appearance; },
      set appearance(value) { thiz.updateSingle("data.data.person.appearance", value); },

      get biography() { return thiz.document.data.data.person.biography; },
      set biography(value) { thiz.updateSingle("data.data.person.biography", value); },
    };
  }
  
  /**
   * @type {Object}
   * @readonly
   */
  get skills() {
    const thiz = this;
    return {
      get all() { return thiz.items.filter(it => it.type === "skill"); },
      get learning() { return thiz.items.filter(it => it.type === "skill" && it.level < 1); },
      get known() { return thiz.items.filter(it => it.type === "skill" && it.level > 0); },
    };
  }

  /**
   * @type {Object}
   * @readonly
   */
  get health() {
    const thiz = this;
    return {
      get injuries() { return thiz.items.filter(it => it.type === "injury"); },
      get illnesses() { return thiz.items.filter(it => it.type === "illness"); },
      get mutations() { return thiz.items.filter(it => it.type === "mutation"); },

      get HP() { return parseInt(thiz.document.data.data.health.HP); },
      set HP(value) { thiz.updateSingle("data.data.health.HP", value); },

      get exhaustion() { return parseInt(thiz.document.data.data.health.exhaustion); },
      set exhaustion(value) { thiz.updateSingle("data.data.health.exhaustion", value); },
      
      get magicStamina() { return parseInt(thiz.document.data.data.health.magicStamina); },
      set magicStamina(value) { thiz.updateSingle("data.data.health.magicStamina", value); },
      
      get maxHP() { return new Ruleset().getCharacterMaximumHp(thiz.document) },
      get maxInjuries() { return new Ruleset().getCharacterMaximumInjuries(thiz.document) },
      get maxExhaustion() { return new Ruleset().getCharacterMaximumExhaustion(thiz.document) },
      get maxMagicStamina() { return new Ruleset().getCharacterMaximumMagicStamina(thiz.document) },
    };
  }

  /**
   * @type {Object}
   * @readonly
   */
  get assets() {
    const thiz = this;
    return {
      get all() { return thiz.items.filter(it => it.type === "item"); },
      get onPerson() { return thiz.items.filter(it => it.type === "item" && it.isOnPerson === true); },
      get remote() { return thiz.items.filter(it => it.type === "item" && it.isOnPerson !== true); },
      get currentBulk() {
        let currentBulk = 0;
        const assetsOnPerson = this.onPerson;
        for (const assetOnPerson of assetsOnPerson) {
          currentBulk += assetOnPerson.bulk;
        }
        return currentBulk;
      },
      get maxBulk() { return new Ruleset().getCharacterMaximumInventory(thiz.document); },
      get grid() { return thiz.document.data.data.assets.grid; },
      get gridIndices() { return thiz.document.data.data.assets.gridIndices; },
    };
  }

  /**
   * @param {Actor} document An encapsulated actor instance. 
   * 
   * @throws {Error} Thrown, if `document` is `undefined`. 
   */
  constructor(document) {
    super(document);

    this.attributeGroups = this._getAttributeGroups();
    this.attributes = this._getAttributes();
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
   * Searches in: 
   * * Attribute names.
   * * Embedded skill name.
   * * Embedded skill ability name.
   * * Embedded asset name.
   * * Embedded injury name.
   * * Embedded illness name.
   * * Embedded mutation name.
   * * Embedded asset name.
   * 
   * @override
   */
  _resolveReference(reference, comparableReference) {
    // Search attributes. 
    let attribute = this.attributes.find(it => it.name === comparableReference);
    if (attribute === undefined) {
      attribute = this.attributes.find(it => game.i18n.localize(it.localizableName).toLowerCase());
    }
    if (attribute !== undefined) {
      return attribute;
    }

    // Search skill. 
    for (const skill of this.skills.all) {
      const match = skill._resolveReference(reference, comparableReference);
      if (match !== undefined) {
        return match;
      }
    }

    // Search asset.
    for (const asset of this.assets.all) {
      const match = asset._resolveReference(reference, comparableReference);
      if (match !== undefined) {
        return match;
      }
    }

    // Search injury.
    for (const injury of this.health.injuries) {
      const match = injury._resolveReference(reference, comparableReference);
      if (match !== undefined) {
        return match;
      }
    }

    // Search illness.
    for (const illness of this.health.illnesses) {
      const match = illness._resolveReference(reference, comparableReference);
      if (match !== undefined) {
        return match;
      }
    }

    // Search mutation.
    for (const mutation of this.health.mutations) {
      const match = mutation._resolveReference(reference, comparableReference);
      if (match !== undefined) {
        return match;
      }
    }

    return super._resolveReference(reference, comparableReference);
  }
}
