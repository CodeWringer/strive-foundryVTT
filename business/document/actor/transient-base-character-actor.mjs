import { TEMPLATES } from '../../../presentation/templatePreloader.mjs';
import { DiceOutcomeTypes } from '../../dice/dice-outcome-types.mjs';
import CharacterAssetSlotGroup from '../../ruleset/asset/character-asset-slot-group.mjs';
import CharacterAssetSlot from '../../ruleset/asset/character-asset-slot.mjs';
import { ATTRIBUTE_GROUPS } from '../../ruleset/attribute/attribute-groups.mjs';
import CharacterAttributeGroup from '../../ruleset/attribute/character-attribute-group.mjs';
import Ruleset from '../../ruleset/ruleset.mjs';
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
 * @property {Array<CharacterAssetSlotGroup>} assets.equipmentSlots 
 * * Read-only. 
 * @property {Array<TransientAsset>} assets.equipped 
 * * Read-only. 
 * @property {Array<TransientAsset>} assets.luggage 
 * * Read-only. 
 * @property {Array<TransientAsset>} assets.property 
 * * Read-only. 
 * @property {Number} assets.currentBulk
 * * Read-only. 
 * @property {Number} assets.maxBulk
 * * Read-only. 
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
      get age() { return parseInt(thiz.document.system.person.age); },
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
      
      get equipmentSlots() { return thiz._equipmentSlots; },

      get equipped() { return thiz._equippedAssets; },
      
      get luggage() { return thiz._luggageAssets; },
      
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
   * @param {Actor} document An encapsulated actor instance. 
   * 
   * @throws {Error} Thrown, if `document` is `undefined`. 
   */
  constructor(document) {
    super(document);

    this.attributeGroups = this._getAttributeGroups();
    this.attributes = this._getAttributes();
    this._prepareAssetsData();
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
    const propertyPath = `system.attributes.${groupName}.${attName}`;

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
    if (outcomeType === DiceOutcomeTypes.NONE) {
      // Do not advance anything for a "none" result. 
      return;
    }

    const attribute = this.attributes.find(it => it.name === attName);

    let successes = attribute.advancementProgress.successes;
    let failures = attribute.advancementProgress.failures;
    let level = attribute.level;

    if (outcomeType === DiceOutcomeTypes.SUCCESS) {
      successes++;
    } else {
      failures++;
    }

    if (autoLevel === true) {
      if (successes >= attribute.advancementRequirements.successes
        && failures >= attribute.advancementRequirements.failures) {
        level++;

        if (resetProgress === true) {
          successes = 0;
          failures = 0;
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
              successes: successes,
              failures: failures,
            }
          }
        }
      }
    });
  }

  /**
   * Adds a new equipment asset slot with the given parameters. 
   * 
   * @param {Object} args 
   * @param {String | undefined} args.customName A user-defined name. 
   * @param {String | undefined} args.localizableName Localization key. 
   * @param {Array<String> | undefined} args.acceptedTypes An array of asset type names that this 
   * slot may hold. E. g. `["clothing"]`
   * @param {String | undefined} args.alottedId If not null, the ID of an asset document 
   * that has been alotted to this slot. 
   */
  addEquipmentAssetSlot(args = {}) {
    const id = createUUID();
    this.updateByPath(`system.assets.equipped.${id}`, {
      customName: args.customName,
      localizableName: args.localizableName,
      acceptedTypes: args.acceptedTypes ?? [],
      alottedId: args.alottedId ?? null,
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
    this._equipmentSlots = this._getEquipmentSlots();

    // Worn & Equipped
    const equippedIds = [];
    const equippedAssets = [];
    for (const group in this._equipmentSlots) {
      for (const slot in group.slots) {
        if (isDefined(slot.alottedId) === true) {
          equippedIds.push(slot.alottedId);
          const asset = this._allAssets.find(asset => asset.id === id);
          if (asset === undefined) {
            game.ambersteel.logger.logWarn("NullReferenceException: equipped asset could not be found on actor");
          } else {
            equippedAssets.push(asset);
          }
        }
      }
    }

    // Luggage

    // TODO #196: Purge obsolete entries:
    /*
// Purge obsolete entries. 
const toCull = ids.filter(id => 
  filtered.find(asset => 
    asset.id === id
  ) === undefined
);
const cleanIdList = [];
for (const id of ids) {
  if (toCull.indexOf(id) < 0) {
    cleanIdList.push(id);
  }
}
this.updateByPath("")
    */

    const luggageIds = this.document.system.assets.luggage;
    const luggageAssets = [];
    for (const id of luggageIds) {
      const asset = this._allAssets.find(asset => asset.id === id);
      if (asset !== undefined) {
        luggageAssets.push(asset);
      }
    }

    // Property
    const propertyAssets = [];
    for (const asset of this._allAssets) {
      if (equippedIds.indexOf(asset.id) < 0 && luggageIds.indexOf(asset.id) < 0) {
        propertyAssets.push(asset);
      }
    }

    this._equippedAssets = equippedAssets;
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
  _getEquipmentSlots() {
    const result = [];

    const equipped = this.document.system.assets.equipped;
    for (const id in equipped) {
      if (equipped.hasOwnProperty(id) !== true) continue;

      const assetSlot = new CharacterAssetSlot({
        actor: this.document,
        id: id,
      });

      let group = result.find(it => it.name === assetSlot.name);
      if (group === undefined) {
        group = new CharacterAssetSlotGroup({
          name: assetSlot.name ?? createUUID(),
          localizableName: assetSlot.localizableName,
          slots: [assetSlot],
        });
        result.push(group);
      } else {
        group.slots.push(assetSlot);
      }
    }

    return result;
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
  _resolveReference(reference, comparableReference, propertyPath) {
    // Search attributes. 
    const attribute = this.attributes.find(it => 
      it.name === comparableReference
        || game.i18n.localize(it.localizableName).toLowerCase() === comparableReference
        || game.i18n.localize(it.localizableAbbreviation).toLowerCase() === comparableReference
    );
    if (attribute !== undefined) {
      return attribute;
    }

    // Search skill. 
    for (const skill of this.skills.all) {
      const match = skill._resolveReference(reference, comparableReference, propertyPath);
      if (match !== undefined) {
        return match;
      }
    }

    // Search asset.
    for (const asset of this.assets.all) {
      const match = asset._resolveReference(reference, comparableReference, propertyPath);
      if (match !== undefined) {
        return match;
      }
    }

    // Search injury.
    for (const injury of this.health.injuries) {
      const match = injury._resolveReference(reference, comparableReference, propertyPath);
      if (match !== undefined) {
        return match;
      }
    }

    // Search illness.
    for (const illness of this.health.illnesses) {
      const match = illness._resolveReference(reference, comparableReference, propertyPath);
      if (match !== undefined) {
        return match;
      }
    }

    // Search mutation.
    for (const mutation of this.health.mutations) {
      const match = mutation._resolveReference(reference, comparableReference, propertyPath);
      if (match !== undefined) {
        return match;
      }
    }

    return super._resolveReference(reference, comparableReference, propertyPath);
  }
}
