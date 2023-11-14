import { TEMPLATES } from '../../../presentation/templatePreloader.mjs';
import { DICE_POOL_RESULT_TYPES } from '../../dice/dice-pool.mjs';
import AtReferencer from '../../referencing/at-referencer.mjs';
import CharacterAssetSlotGroup from '../../ruleset/asset/character-asset-slot-group.mjs';
import CharacterAssetSlot from '../../ruleset/asset/character-asset-slot.mjs';
import { ATTRIBUTE_GROUPS } from '../../ruleset/attribute/attribute-groups.mjs';
import { ATTRIBUTES } from '../../ruleset/attribute/attributes.mjs';
import CharacterAttributeGroup from '../../ruleset/attribute/character-attribute-group.mjs';
import { CharacterHealthState } from '../../ruleset/health/character-health-state.mjs';
import { HEALTH_STATES } from '../../ruleset/health/health-states.mjs';
import Ruleset from '../../ruleset/ruleset.mjs';
import { SKILL_TAGS } from '../../tags/system-tags.mjs';
import LoadHealthStatesSettingUseCase from '../../use-case/load-health-states-setting-use-case.mjs';
import { createUUID } from '../../util/uuid-utility.mjs';
import { isDefined } from '../../util/validation-utility.mjs';
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
 * @property {Number} baseInitiative 
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
 * @property {Array<TransientSkill>} skills.innate Returns all innate skills of the character. 
 * * Read-only. 
 * @property {Object} health
 * * Read-only. 
 * @property {Array<TransientInjury>} health.injuries 
 * * Read-only. 
 * @property {Array<TransientIllness>} health.illnesss 
 * * Read-only. 
 * @property {Array<TransientMutation>} health.mutations 
 * * Read-only. 
 * @property {Array<TransientScar>} health.scars 
 * * Read-only. 
 * @property {Array<CharacterHealthState>} health.states
 * * Getter returns a safe-copy.
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
 * @property {Array<CharacterAssetSlotGroup>} assets.equipmentSlotGroups 
 * * Read-only. 
 * @property {Array<TransientAsset>} assets.all 
 * * Read-only. 
 * @property {Array<TransientAsset>} assets.equipment 
 * * Read-only. 
 * @property {Array<TransientAsset>} assets.luggage 
 * @property {Array<TransientAsset>} assets.property 
 * * Read-only. 
 * @property {Number} assets.currentBulk
 * * Read-only. 
 * @property {Number} assets.maxBulk
 * * Read-only. 
 * 
 * @property {Object} personalityTraits
 * * Read-only
 * @property {Number} personalityTraits.arrogantOrHumble
 * * Read-only
 * * Ranges from -3 to +3
 * @property {Number} personalityTraits.cowardlyOrCourageous
 * * Read-only
 * * Ranges from -3 to +3
 * @property {Number} personalityTraits.cruelOrMerciful
 * * Read-only
 * * Ranges from -3 to +3
 * @property {Number} personalityTraits.deceitfulOrHonest
 * * Read-only
 * * Ranges from -3 to +3
 * @property {Number} personalityTraits.lazyOrEnergetic
 * * Read-only
 * * Ranges from -3 to +3
 * @property {Number} personalityTraits.paranoidOrNaive
 * * Read-only
 * * Ranges from -3 to +3
 * @property {Number} personalityTraits.recklessOrPrudent
 * * Read-only
 * * Ranges from -3 to +3
 * @property {Number} personalityTraits.selfishOrConsiderate
 * * Read-only
 * * Ranges from -3 to +3
 * @property {Number} personalityTraits.vengefulOrForgiving
 * * Read-only
 * * Ranges from -3 to +3
 */
export default class TransientBaseCharacterActor extends TransientBaseActor {
  /** @override */
  get defaultImg() { return "icons/svg/mystery-man.svg"; }
  
  /** @override */
  get chatMessageTemplate() { return TEMPLATES.ACTOR_CHAT_MESSAGE; }

  /**
   * @type {Object}
   * @readonly
   */
  get person() {
    const thiz = this;
    return {
      get age() { return thiz.document.system.person.age; },
      set age(value) { thiz.updateByPath("system.person.age", value); },

      get species() { return thiz.document.system.person.species; },
      set species(value) { thiz.updateByPath("system.person.species", value); },

      get culture() { return thiz.document.system.person.culture; },
      set culture(value) { thiz.updateByPath("system.person.culture", value); },

      get sex() { return thiz.document.system.person.sex; },
      set sex(value) { thiz.updateByPath("system.person.sex", value); },

      get appearance() { return thiz.document.system.person.appearance; },
      set appearance(value) { thiz.updateByPath("system.person.appearance", value); },

      get biography() { return thiz.document.system.person.biography; },
      set biography(value) { thiz.updateByPath("system.person.biography", value); },
    };
  }

  /**
   * @type {Object}
   * @readonly
   */
  get personalityTraits() {
    const thiz = this;
    /**
     * Returns the given value, but kept within the range of -3 to +3. 
     * 
     * E. g. `-5` would return `-3`; `35` would return `3`; `1` would return `1`. 
     * 
     * @param {Number | String} value A value to keep in the bounds of -3 and +3. 
     * 
     * @returns {Number} The bounded value. 
     * 
     * @private
     */
    const _getBoundedPersonalityTrait = function(value) {
      return Math.max(-3, Math.min(3, parseInt(value)));
    }

    /**
     * Persists the given value only, if it is not `undefined`. 
     * 
     * @param {String} propertyName Internal name of the personality trait. 
     * * E. g. `"arrogantOrHumble"`
     * @param {Number | undefined} value
     * 
     * @private
     */
    const _updateIfNotUndefined = function(propertyName, value) {
      if (value === undefined) return;

      thiz.updateByPath(`system.personalityTraits.${propertyName}`, _getBoundedPersonalityTrait(value));
    }

    return {
      get arrogantOrHumble() { return parseInt((thiz.document.system.personalityTraits ?? {}).arrogantOrHumble ?? 0); },
      set arrogantOrHumble(value) { _updateIfNotUndefined("arrogantOrHumble", value) },
      
      get cowardlyOrCourageous() { return parseInt((thiz.document.system.personalityTraits ?? {}).cowardlyOrCourageous ?? 0); },
      set cowardlyOrCourageous(value) { _updateIfNotUndefined("cowardlyOrCourageous", value) },

      get cruelOrMerciful() { return parseInt((thiz.document.system.personalityTraits ?? {}).cruelOrMerciful ?? 0); },
      set cruelOrMerciful(value) { _updateIfNotUndefined("cruelOrMerciful", value) },
      
      get deceitfulOrHonest() { return parseInt((thiz.document.system.personalityTraits ?? {}).deceitfulOrHonest ?? 0); },
      set deceitfulOrHonest(value) { _updateIfNotUndefined("deceitfulOrHonest", value) },

      get lazyOrEnergetic() { return parseInt((thiz.document.system.personalityTraits ?? {}).lazyOrEnergetic ?? 0); },
      set lazyOrEnergetic(value) { _updateIfNotUndefined("lazyOrEnergetic", value) },

      get paranoidOrNaive() { return parseInt((thiz.document.system.personalityTraits ?? {}).paranoidOrNaive ?? 0); },
      set paranoidOrNaive(value) { _updateIfNotUndefined("paranoidOrNaive", value) },

      get recklessOrPrudent() { return parseInt((thiz.document.system.personalityTraits ?? {}).recklessOrPrudent ?? 0); },
      set recklessOrPrudent(value) { _updateIfNotUndefined("recklessOrPrudent", value) },

      get selfishOrConsiderate() { return parseInt((thiz.document.system.personalityTraits ?? {}).selfishOrConsiderate ?? 0); },
      set selfishOrConsiderate(value) { _updateIfNotUndefined("selfishOrConsiderate", value) },

      get vengefulOrForgiving() { return parseInt((thiz.document.system.personalityTraits ?? {}).vengefulOrForgiving ?? 0); },
      set vengefulOrForgiving(value) { _updateIfNotUndefined("vengefulOrForgiving", value) },
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
      get learning() { return thiz.items.filter(it => 
        it.type === "skill" && it.level < 1
          && it.tags.find(tag => tag.id === SKILL_TAGS.INNATE.id) === undefined
        ); 
      },
      get known() { return thiz.items.filter(it => 
        it.type === "skill" && it.level > 0
          && it.tags.find(tag => tag.id === SKILL_TAGS.INNATE.id) === undefined
        ); 
      },
      get innate() { return thiz.items.filter(it => 
        it.type === "skill" 
        && it.tags.find(tag => tag.id === SKILL_TAGS.INNATE.id) !== undefined
        ); 
      },
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
      get scars() { return thiz.items.filter(it => it.type === "scar"); },

      get HP() { return parseInt(thiz.document.system.health.HP); },
      set HP(value) { thiz.updateByPath("system.health.HP", value); },

      get exhaustion() { return parseInt(thiz.document.system.health.exhaustion); },
      set exhaustion(value) { thiz.updateByPath("system.health.exhaustion", value); },
      
      get magicStamina() { return parseInt(thiz.document.system.health.magicStamina); },
      set magicStamina(value) { thiz.updateByPath("system.health.magicStamina", value); },
      
      get maxHP() { return new Ruleset().getCharacterMaximumHp(thiz.document) },
      get maxInjuries() { return new Ruleset().getCharacterMaximumInjuries(thiz.document) },
      get maxExhaustion() { return new Ruleset().getCharacterMaximumExhaustion(thiz.document) },
      get maxMagicStamina() { return new Ruleset().getCharacterMaximumMagicStamina(thiz.document) },
      
      get states() { return thiz._healthStates.concat([]); },
      set states(value) {
        const dtoArray = value.map((healthState) => {
          return {
            name: healthState.name,
            intensity: healthState.intensity,
          };
        });
        thiz.updateByPath("system.health.states", dtoArray);
      },
    };
  }

  /**
   * @type {Object}
   * @readonly
   */
  get assets() {
    const thiz = this;
    return {
      get all() { return thiz._allAssets; },
      
      get equipmentSlotGroups() { return thiz._equipmentSlotGroups; },

      get equipment() { return thiz._equipmentAssets; },
      
      get luggage() { return thiz._luggageAssets; },
      set luggage(value) {
        thiz.updateByPath("system.assets.luggage", 
        value.map(it => it.id));
      },
      
      get property() { return thiz._propertyAssets; },

      get currentBulk() {
        let currentBulk = 0;
        const luggage = this.luggage;
        for (const asset of luggage) {
          currentBulk += asset.bulk;
        }
        return currentBulk;
      },
      get maxBulk() { return new Ruleset().getCharacterCarryingCapacity(thiz.document); },
    };
  }

  /**
   * @type {Number}
   * @readonly
   */
  get baseInitiative() {
    const perceptionLevel = this.attributes.find(it => it.name === ATTRIBUTES.perception.name).modifiedLevel;
    const intelligenceLevel = this.attributes.find(it => it.name === ATTRIBUTES.intelligence.name).modifiedLevel;
    const empathyLevel = this.attributes.find(it => it.name === ATTRIBUTES.empathy.name).modifiedLevel;

    return perceptionLevel + intelligenceLevel + empathyLevel;
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
    this._prepareAssetsData();
    this._healthStates = this._getHealthStates();
  }

  /**
   * Advances the skill, based on the given {DicePoolRollResult}. 
   * 
   * @param {DicePoolRollResult} rollResult 
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
   * @param {String} attName Internal name of an attribute, e.g. `"strength"`. 
   * @param {Number | undefined} newValue Value to set the attribute to, e.g. `4`. 
   * * Default `0`
   * @param {Boolean | undefined} resetProgress If true, will also reset advancement progress. 
   * * Default `true`
   * 
   * @async
   */
  async setAttributeLevel(attName, newValue = 0, resetProgress = true) {
    const groupName = new Ruleset().getAttributeGroupName(attName);
    const propertyPath = `system.attributes.${groupName}.${attName}`;

    if (resetProgress === true) {
      await this.document.update({
        [`${propertyPath}.level`]: newValue,
        [`${propertyPath}.progress`]: 0
      });
    } else {
      await this.document.update({
        [`${propertyPath}.level`]: newValue,
      });
    }
  }

  /**
   * Adds advancement progress to an attribute. 
   * 
   * Also auto-levels up the attribute, if 'autoLevel' is set to true. 
   * 
   * @param {DicePoolRollResultType} outcomeType The test outcome to work with. 
   * @param {String | undefined} attName Optional. Internal name of an attribute, 
   * e.g. `"strength"`. 
   * @param {Boolean | undefined} autoLevel Optional. If true, will auto-level up. 
   * Default `false`
   * @param {Boolean | undefined} resetProgress Optional. If true, will also reset 
   * advancement progress, if `autoLevel` is also true and a level automatically 
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
    if (outcomeType === DICE_POOL_RESULT_TYPES.NONE) {
      // Do not advance anything for a "none" result. 
      return;
    }

    const attribute = this.attributes.find(it => it.name === attName);

    let progress = attribute.advancementProgress + 1;
    let level = attribute.level;

    if (autoLevel === true) {
      if (progress >= attribute.advancementRequirements) {
        level++;

        if (resetProgress === true) {
          progress = 0;
        }
      }
    }

    const groupName = new Ruleset().getAttributeGroupName(attName);

    await this.document.update({
      system: {
        attributes: {
          [groupName]: {
            [attName]: {
              level: level,
              progress: progress,
            }
          }
        }
      }
    });
  }

  /**
   * Returns the grouped attributes of the character. 
   * 
   * @returns {Array<CharacterAttributeGroup>}
   * 
   * @private
   */
  _getAttributeGroups() {
    return ATTRIBUTE_GROUPS.asArray().map(attributeGroup => 
      new CharacterAttributeGroup(this.document, attributeGroup.name)
    );
  }
  
  /**
   * Returns the attributes of the character. 
   * 
   * @returns {Array<CharacterAttribute>}
   * 
   * @private
   */
  _getAttributes() {
    const result = [];

    const attributeGroups = this._getAttributeGroups();
    for(const attributeGroup of attributeGroups) {
      for (const attribute of attributeGroup.attributes) {
        result.push(attribute);
      }
    }

    return result;
  }

  /**
   * @private
   */
  _prepareAssetsData() {
    this._allAssets = this.items.filter(it => it.type === "item");
    this._equipmentSlotGroups = this._getEquipmentSlotGroups();

    // Worn & Equipped
    const equipmentIds = [];
    const equipmentAssets = [];
    for (const group of this._equipmentSlotGroups) {
      for (const slot of group.slots) {
        if (isDefined(slot.alottedId) === true) {
          const asset = this._allAssets.find(asset => asset.id === slot.alottedId);
          if (asset === undefined) {
            game.ambersteel.logger.logWarn("NullReferenceException: equipped asset could not be found on actor");
            slot.alottedId = null;
          } else {
            equipmentIds.push(slot.alottedId);
            equipmentAssets.push(asset);
          }
        }
      }
    }

    // Luggage
    const luggageIds = this.document.system.assets.luggage;
    const luggageAssets = [];
    for (const id of luggageIds) {
      // Cull duplicates. 
      const isDuplicate = luggageAssets.find(asset => asset.id === id) !== undefined;
      if (isDuplicate === true) continue;

      // Add asset to luggage list. 
      const asset = this._allAssets.find(asset => asset.id === id);
      if (asset !== undefined) {
        luggageAssets.push(asset);
      }
    }

    // Property
    const propertyAssets = [];
    for (const asset of this._allAssets) {
      if (equipmentIds.indexOf(asset.id) < 0 && luggageIds.indexOf(asset.id) < 0) {
        propertyAssets.push(asset);
      }
    }

    this._equipmentAssets = equipmentAssets;
    this._luggageAssets = luggageAssets;
    this._propertyAssets = propertyAssets;
  }

  /**
   * Returns the "worn & equipment" asset slots of the character. 
   * 
   * @returns {Array<CharacterAssetSlotGroup>}
   * 
   * @private
   */
  _getEquipmentSlotGroups() {
    const result = [];

    const groups = this.document.system.assets.equipment;
    for (const groupId in groups) {
      if (groups.hasOwnProperty(groupId) !== true) continue;

      const assetSlotGroup = new CharacterAssetSlotGroup({
        actor: this,
        id: groupId,
      });
      result.push(assetSlotGroup);
    }

    return result;
  }

  /**
   * Returns the health states of the character. 
   * 
   * @returns {Array<CharacterHealthState>}
   * 
   * @private
   */
  _getHealthStates() {
    const rawArray = this.document.system.health.states;
    const stateSettings = new LoadHealthStatesSettingUseCase().invoke();
    const result = [];
    let definition = undefined;

    for (const entry of rawArray) {
      // First try to get system-defined state. 
      definition = HEALTH_STATES[entry.name];
      if (definition === undefined) {
        // Second try - is it a custom-defined state?
        // For backwards-compatibility, also attempt to use the `it` directly - 
        // in older versions, custom health states were defined as a string, instead of object. 
        definition = stateSettings.custom.find(it => (it.name ?? it) === entry.name);
        if (definition === undefined) {
          game.ambersteel.logger.logWarn(`Failed to get health state definition '${entry.name}'`);
          continue;
        }
      }

      const healthState = new CharacterHealthState({
        name: entry.name,
        localizableName: definition.localizableName ?? entry.name,
        icon: definition.icon, 
        limit: definition.limit,
        intensity: entry.intensity,
      });
      result.push(healthState);
    }
    return result;
  }

  /**
   * @override
   * 
   * Searches in: 
   * * Attribute names.
   * * Embedded skill name.
   * * Embedded skill ability name.
   * * Embedded asset name.
   * * Embedded injury name.
   * * Embedded illness name.
   * * Embedded mutation name.
   * * Embedded scar name.
   * * Embedded asset name.
   */
  resolveReference(comparableReference, propertyPath) {
    // Search attributes. 
    const attribute = this.attributes.find(it => 
      it.name === comparableReference
        || game.i18n.localize(it.localizableName).toLowerCase() === comparableReference
        || game.i18n.localize(it.localizableAbbreviation).toLowerCase() === comparableReference
    );
    if (attribute !== undefined) {
      return attribute;
    }

    const collectionsToSearch = [
      this.skills.all,
      this.assets.all,
      this.health.injuries,
      this.health.illnesses,
      this.health.mutations,
      this.health.scars,
    ];
    return new AtReferencer().resolveReferenceInCollections(collectionsToSearch, comparableReference, propertyPath);
  }
}
