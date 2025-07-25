import { ExtenderUtil } from '../../../common/extender-util.mjs';
import AtReferencer from '../../referencing/at-referencer.mjs';
import CharacterAssetSlotGroup from '../../ruleset/asset/character-asset-slot-group.mjs';
import { ATTRIBUTES } from '../../ruleset/attribute/attributes.mjs';
import CharacterAttribute from '../../ruleset/attribute/character-attribute.mjs';
import { CharacterHealthCondition } from '../../ruleset/health/character-health-state.mjs';
import { HEALTH_CONDITIONS } from '../../ruleset/health/health-states.mjs';
import Ruleset from '../../ruleset/ruleset.mjs';
import GameSystemWorldSettings from '../../setting/game-system-world-settings.mjs';
import { SKILL_TAGS } from '../../tags/system-tags.mjs';
import { PropertyUtil } from '../../util/property-utility.mjs';
import { ValidationUtil } from '../../util/validation-utility.mjs';
import { ITEM_TYPES } from '../item/item-types.mjs';
import TransientBaseActor from './transient-base-actor.mjs';

/**
 * Represents the base contract for a "specific" actor "sub-type" that 
 * represents a "character", in the way the rule set regards them. 
 * 
 * @extends TransientBaseActor
 * 
 * @property {Array<CharacterAttribute>} attributes The attributes of the character. 
 * * Read-only. 
 * @property {Number} baseInitiative 
 * * Read-only. 
 * @property {Number} sprintingSpeed 
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
 * @property {Array<CharacterHealthCondition>} health.states
 * * Getter returns a safe-copy.
 * @property {Number} health.HP 
 * @property {Number} health.maxHP 
 * * Read-only. 
 * @property {Number} health.maxHpModifier 
 * @property {Number} health.modifiedMaxHp 
 * * Read-only. 
 * @property {Number} health.injuryShrugOffs 
 * @property {Number} health.exhaustion 
 * @property {Number} health.maxExhaustion 
 * * Read-only. 
 * @property {Number} health.maxExhaustionModifier 
 * @property {Number} health.modifiedMaxExhaustion 
 * * Read-only. 
 * @property {Number} health.deathSaves
 * @property {Number} health.deathSaveLimit
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
 * * Ranges from -3 to +3
 * @property {Number} personalityTraits.cowardlyOrCourageous
 * * Ranges from -3 to +3
 * @property {Number} personalityTraits.cruelOrMerciful
 * * Ranges from -3 to +3
 * @property {Number} personalityTraits.deceitfulOrHonest
 * * Ranges from -3 to +3
 * @property {Number} personalityTraits.lazyOrEnergetic
 * * Ranges from -3 to +3
 * @property {Number} personalityTraits.paranoidOrNaive
 * * Ranges from -3 to +3
 * @property {Number} personalityTraits.recklessOrPrudent
 * * Ranges from -3 to +3
 * @property {Number} personalityTraits.selfishOrConsiderate
 * * Ranges from -3 to +3
 * @property {Number} personalityTraits.vengefulOrForgiving
 * * Ranges from -3 to +3
 * 
 * @property {Object} driverSystem
 * * Read-only. 
 * @property {String} driverSystem.ambition
 * 
 * @property {Object} driverSystem.aspirations
 * @property {String} driverSystem.aspirations.0
 * @property {String} driverSystem.aspirations.1
 * @property {String} driverSystem.aspirations.2
 * 
 * @property {Object} driverSystem.reactions
 * @property {String} driverSystem.reactions.0
 * @property {String} driverSystem.reactions.1
 * @property {String} driverSystem.reactions.2
 * 
 * @property {Object} actionPoints 
 * @property {Number} actionPoints.current The current number of action points of this character. 
 * @property {Number} actionPoints.maximum The maximum number of action points allowed for this character. 
 * 
 * @property {Object} actionPoints.refill 
 * @property {Boolean} actionPoints.refill.enable If `true`, automatic AP refilling is enabled for this character. 
 * @property {Number} actionPoints.refill.amount The number of action points regained each turn for this character. 
 * 
 * @property {Object} gritPoints
 * @property {Number} gritPoints.current The current number of grit points of this character. 
 * @property {Boolean} gritPoints.enable If `true`, grit points are enabled character. 
 * 
 * @property {Object} initiative 
 * @property {Number} initiative.perTurn 
 */
export default class TransientBaseCharacterActor extends TransientBaseActor {
  /** @override */
  get defaultImg() { return "icons/svg/mystery-man.svg"; }
  
  /** @override */
  get chatMessageTemplate() { return game.strive.const.TEMPLATES.ACTOR_CHAT_MESSAGE; }

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
  get driverSystem() {
    const thiz = this;

    return {
      get ambition() { return (thiz.document.system.driverSystem ?? {}).ambition ?? ""; },
      set ambition(value) { thiz.updateByPath("system.driverSystem.ambition", value); },

      get aspirations() {
        return {
          get _0() { return ((thiz.document.system.driverSystem ?? {}).aspirations ?? {})._0 ?? ""; },
          set _0(value) { thiz.updateByPath("system.driverSystem.aspirations._0", value); },
          get _1() { return ((thiz.document.system.driverSystem ?? {}).aspirations ?? {})._1 ?? ""; },
          set _1(value) { thiz.updateByPath("system.driverSystem.aspirations._1", value); },
          get _2() { return ((thiz.document.system.driverSystem ?? {}).aspirations ?? {})._2 ?? ""; },
          set _2(value) { thiz.updateByPath("system.driverSystem.aspirations._2", value); },
        }
      },
      
      get reactions() {
        return {
          get _0() { return ((thiz.document.system.driverSystem ?? {}).reactions ?? {})._0 ?? ""; },
          set _0(value) { thiz.updateByPath("system.driverSystem.reactions._0", value); },
          get _1() { return ((thiz.document.system.driverSystem ?? {}).reactions ?? {})._1 ?? ""; },
          set _1(value) { thiz.updateByPath("system.driverSystem.reactions._1", value); },
          get _2() { return ((thiz.document.system.driverSystem ?? {}).reactions ?? {})._2 ?? ""; },
          set _2(value) { thiz.updateByPath("system.driverSystem.reactions._2", value); },
        }
      },
    };
  }
  
  /**
   * @type {Object}
   * @readonly
   */
  get skills() {
    const thiz = this;
    return {
      get all() { return thiz.items.filter(it => it.type === ITEM_TYPES.SKILL); },
      get learning() { return thiz.items.filter(it => 
        it.type === ITEM_TYPES.SKILL && it.level < 1
          && it.tags.find(tag => tag.id === SKILL_TAGS.INNATE.id) === undefined
        ); 
      },
      get known() { return thiz.items.filter(it => 
        it.type === ITEM_TYPES.SKILL && it.level > 0
          && it.tags.find(tag => tag.id === SKILL_TAGS.INNATE.id) === undefined
        ); 
      },
      get innate() { return thiz.items.filter(it => 
        it.type === ITEM_TYPES.SKILL 
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
      get injuries() { return thiz.items.filter(it => it.type === ITEM_TYPES.INJURY); },
      get illnesses() { return thiz.items.filter(it => it.type === ITEM_TYPES.ILLNESS); },
      get mutations() { return thiz.items.filter(it => it.type === ITEM_TYPES.MUTATION); },
      get scars() { return thiz.items.filter(it => it.type === ITEM_TYPES.SCAR); },

      // HP
      get maxHP() { return new Ruleset().getCharacterMaximumHp(thiz.document) },
      
      get maxHpModifier() { return parseInt(thiz.document.system.health.maxHpModifier ?? 0); },
      set maxHpModifier(value) { thiz.updateByPath("system.health.maxHpModifier", value); },
      
      get modifiedMaxHp() { return this.maxHP + this.maxHpModifier; },

      get HP() { return parseInt(thiz.document.system.health.HP ?? 0); },
      set HP(value) {
        const clampedHP = Math.max(0, Math.min(value, this.maxHP));
        thiz.updateByPath("system.health.HP", clampedHP);
      },

      // Exhaustion
      get maxExhaustion() { return new Ruleset().getCharacterMaximumExhaustion(thiz.document) },
      
      get maxExhaustionModifier() { return parseInt(thiz.document.system.health.maxExhaustionModifier ?? 0); },
      set maxExhaustionModifier(value) { thiz.updateByPath("system.health.maxExhaustionModifier", value); },

      get modifiedMaxExhaustion() { return this.maxExhaustion + this.maxExhaustionModifier; },

      get exhaustion() { return parseInt(thiz.document.system.health.exhaustion ?? 0); },
      set exhaustion(value) { thiz.updateByPath("system.health.exhaustion", value); },

      // Injury shrug off
      get injuryShrugOffs() { return parseInt(thiz.document.system.health.injuryShrugOffs ?? 0); },
      set injuryShrugOffs(value) { thiz.updateByPath("system.health.injuryShrugOffs", value); },

      // Conditions (used to be called health states)
      get states() { return thiz._healthStates.concat([]); },
      set states(value) {
        const dtoArray = value.map((healthCondition) => {
          return {
            name: healthCondition.name,
            intensity: healthCondition.intensity,
          };
        });
        thiz.updateByPath("system.health.states", dtoArray);
      },

      // Death saves
      get deathSaves() { return parseInt(thiz.document.system.health.deathSaves ?? 0); },
      set deathSaves(value) { thiz.updateByPath("system.health.deathSaves", value); },

      // Death save limit
      get deathSaveLimit() { return parseInt(thiz.document.system.health.deathSaveLimit ?? 3); },
      set deathSaveLimit(value) { thiz.updateByPath("system.health.deathSaveLimit", value); },
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
   * @type {Object}
   * @readonly
   */
  get actionPoints() {
    const thiz = this;
    return {
      get current() { return PropertyUtil.guaranteeObject(thiz.document.system.actionPoints).current ?? 3; },
      set current(value) { thiz.updateByPath("system.actionPoints.current", value); },
      
      get maximum() { return PropertyUtil.guaranteeObject(thiz.document.system.actionPoints).maximum ?? 5; },
      set maximum(value) {
        thiz.update({
          system: {
            actionPoints: {
              maximum: value,
              current: Math.min(value, this.current),
            }
          }
        });
      },

      get refill() {
        return {
          get amount() { return PropertyUtil.guaranteeObject(PropertyUtil.guaranteeObject(thiz.document.system.actionPoints).refill).amount ?? 3; },
          set amount(value) { thiz.updateByPath("system.actionPoints.refill.amount", value); },

          get enable() { return PropertyUtil.guaranteeObject(PropertyUtil.guaranteeObject(thiz.document.system.actionPoints).refill).enable ?? true; },
          set enable(value) { thiz.updateByPath("system.actionPoints.refill.enable", value); },
        };
      },
    };
  }

  /**
   * @type {Object}
   * @readonly
   */
  get gritPoints() {
    const thiz = this;
    return {
      /**
       * @type {Number}
       */
      get current() { return PropertyUtil.guaranteeObject(thiz.document.system.gritPoints).current ?? 0; },
      set current(value) { thiz.updateByPath("system.gritPoints.current", value); },
      
      /**
       * @type {Boolean}
       */
      get enable() { return PropertyUtil.guaranteeObject(thiz.document.system.gritPoints).enable ?? false; },
      set enable(value) { thiz.updateByPath("system.gritPoints.enable", value); },
    };
  }

  /**
   * @type {Object}
   * @readonly
   */
  get initiative() {
    const thiz = this;
    return {
      /**
       * @type {Number}
       */
      get perTurn() { return PropertyUtil.guaranteeObject(thiz.document.system.initiative).perTurn ?? 1; },
      set perTurn(value) { thiz.updateByPath("system.initiative.perTurn", value); },
    };
  }

  /**
   * @type {Number}
   * @readonly
   */
  get baseInitiative() {
    const attributesToSum = [
      this.attributes.find(it => it.name === ATTRIBUTES.agility.name),
      this.attributes.find(it => it.name === ATTRIBUTES.awareness.name),
      this.attributes.find(it => it.name === ATTRIBUTES.wit.name),
    ];

    let result = 0;
    attributesToSum.forEach(attribute => {
      result += parseInt(attribute.modifiedLevel);
    });

    return result;
  }

  /**
   * @type {Number}
   * @readonly
   */
  get sprintingSpeed() {
    const attributesToSum = [
      this.attributes.find(it => it.name === ATTRIBUTES.agility.name),
      this.attributes.find(it => it.name === ATTRIBUTES.toughness.name),
    ];

    let result = 0;
    attributesToSum.forEach(attribute => {
      result += parseInt(attribute.modifiedLevel);
    });

    return Math.ceil(result / 2);
  }

  /**
   * @param {Actor} document An encapsulated actor instance. 
   * 
   * @throws {Error} Thrown, if `document` is `undefined`. 
   */
  constructor(document) {
    super(document);

    this._prepareAssetsData();
    this._healthStates = this._getHealthStates();
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
    const propertyPath = `system.attributes.${attName}`;

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

  get attributes() {
    try {
      return game.strive.const.ATTRIBUTES.asArray().map(attribute => 
        new CharacterAttribute(this.document, attribute.name)
      )
    } catch (error) {
      game.strive.logger.logError(error);
    }
  }

  /**
   * @private
   */
  _prepareAssetsData() {
    this._allAssets = this.items.filter(it => it.type === ITEM_TYPES.ASSET);
    this._equipmentSlotGroups = this._getEquipmentSlotGroups();

    // Worn & Equipped
    const equipmentIds = [];
    const equipmentAssets = [];
    for (const group of this._equipmentSlotGroups) {
      for (const slot of group.slots) {
        if (ValidationUtil.isDefined(slot.alottedId) === true) {
          const asset = this._allAssets.find(asset => asset.id === slot.alottedId);
          if (asset === undefined) {
            game.strive.logger.logWarn("NullReferenceException: equipped asset could not be found on actor");
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
   * @returns {Array<CharacterHealthCondition>}
   * 
   * @private
   */
  _getHealthStates() {
    const rawArray = this.document.system.health.states;
    const stateSettings = new GameSystemWorldSettings().get(GameSystemWorldSettings.KEY_CUSTOM_HEALTH_CONDITIONS);
    const result = [];
    let definition = undefined;

    for (const entry of rawArray) {
      // First try to get system-defined state. 
      definition = HEALTH_CONDITIONS[entry.name];
      if (definition === undefined) {
        // Second try - is it a custom-defined state?
        // For backwards-compatibility, also attempt to use the `it` directly - 
        // in older versions, custom health states were defined as a string, instead of object. 
        definition = stateSettings.custom.find(it => (it.name ?? it) === entry.name);
        if (definition === undefined) {
          game.strive.logger.logWarn(`Failed to get health condition definition '${entry.name}'`);
          continue;
        }
      }

      const healthCondition = new CharacterHealthCondition({
        ...definition,
        localizableName: definition.localizableName ?? entry.name,
        intensity: entry.intensity,
      });
      result.push(healthCondition);
    }
    return result;
  }

  /**
   * @override
   * 
   * Searches in: 
   * * Attribute names.
   * * Embedded skill name.
   * * Embedded expertise name.
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

  /** @override */
  getExtenders() {
    return super.getExtenders().concat(ExtenderUtil.getExtenders(TransientBaseCharacterActor));
  }
}
