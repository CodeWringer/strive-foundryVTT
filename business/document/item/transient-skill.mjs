import { TEMPLATES } from "../../../presentation/templatePreloader.mjs";
import { createUUID } from "../../util/uuid-utility.mjs";
import SkillChatMessageViewModel from "../../../presentation/sheet/item/skill/skill-chat-message-viewmodel.mjs";
import { SummedData, SummedDataComponent } from "../../ruleset/summed-data.mjs";
import DamageAndType from "../../ruleset/skill/damage-and-type.mjs";
import { DiceOutcomeTypes } from "../../dice/dice-outcome-types.mjs";
import PreparedChatData from "../../../presentation/chat/prepared-chat-data.mjs";
import { DAMAGE_TYPES } from "../../ruleset/damage-types.mjs";
import { SOUNDS_CONSTANTS } from "../../../presentation/audio/sounds.mjs";
import { ITEM_SUBTYPE } from "./item-subtype.mjs";
import TransientBaseItem from "./transient-base-item.mjs";
import LevelAdvancement from "../../ruleset/level-advancement.mjs";
import Ruleset from "../../ruleset/ruleset.mjs";
import SkillAbility from "../../ruleset/skill/skill-ability.mjs";
import CharacterAttribute from "../../ruleset/attribute/character-attribute.mjs";
import { ATTACK_TYPES } from "../../ruleset/skill/attack-types.mjs";
import { ATTRIBUTES } from "../../ruleset/attribute/attributes.mjs";
import { isBlankOrUndefined, isObject } from "../../util/validation-utility.mjs";
import { SKILL_PROPERTIES } from "./item-properties.mjs";
import { arrayContains } from "../../util/array-utility.mjs";
import { getAsArray, getAsChoices } from "../../util/constants-utility.mjs";

/**
 * Represents a skill type document's "head" state. 
 * 
 * A head state of a skill determines how much data fidelity its 
 * associated skill exposes and makes interactible to the user. 
 * 
 * @property {String} name Internal name. 
 * @property {String | undefined} localizableName Localization key. 
 * @property {String | undefined} icon CSS class of an icon. 
 * * E. g. `"fas fa-virus"`
 */
export class SkillHeadState {
  /**
   * @param {Object} args
   * @param {String} args.name Internal name. 
   * @param {String | undefined} args.localizableName Localization key. 
   * @param {String | undefined} args.icon CSS class of an icon. 
   * * E. g. `"fas fa-virus"`
   */
  constructor(args = {}) {
    this.name = args.name;
    this.localizableName = args.localizableName;
    this.icon = args.icon;
  }
}

/**
 * Represents the defined skill head states. 
 * 
 * @property {HealthState} full All of the skills data is available. 
 * @property {HealthState} level_only Only name, icon, unmodified level and 
 * skill ability list are exposed. 
 * @property {HealthState} headless Only name, icon and skill ability 
 * list are exposed. 
 * 
 * @constant
 */
export const SKILL_HEAD_STATES = {
  full: new SkillHeadState({
    name: "full",
    localizableName: "ambersteel.character.skill.headStates.full",
  }),
  level_only: new SkillHeadState({
    name: "level_only",
    localizableName: "ambersteel.character.skill.headStates.level_only",
  }),
  headless: new SkillHeadState({
    name: "headless",
    localizableName: "ambersteel.character.skill.headStates.headless",
  }),
  get asChoices() {
    if (this._asChoices === undefined) {
      this._asChoices = getAsChoices(this, ["asChoices", "_asChoices", "asArray", "_asArray"]);
    }
    return this._asChoices;
  },
  get asArray() {
    if (this._asArray === undefined) {
      this._asArray = getAsArray(this, ["asChoices", "_asChoices", "asArray", "_asArray"]);
    }
    return this._asArray;
  }
}

/**
 * Represents the full transient data of a skill. 
 * 
 * @extends TransientBaseItem
 * 
 * @property {LevelAdvancement} advancementRequirements The current requirements 
 * to advance the skill. 
 * @property {LevelAdvancement} advancementProgress The current progress towards 
 * advancing the skill. 
 * @property {Number} level The current raw level. 
 * @property {Number} levelModifier The current level modifier. This number can be negative. 
 * @property {Number} modifiedLevel The current modified level. 
 * * Read-only. 
 * @property {Attribute} relatedAttribute The attribute that serves as the basis 
 * for this skill. 
 * @property {Array<SkillAbility>} abilities The array of skill abilities of this skill. 
 * @property {Boolean} isMagicSchool Returns true, if the skill is considered 
 * a magic school. 
 * @property {SkillHeadState} headState The current degree of data fidelity to expose. 
 */
export default class TransientSkill extends TransientBaseItem {
  /** @override */
  get defaultImg() { return "icons/svg/book.svg"; }
  
  /** @override */
  get chatMessageTemplate() { return TEMPLATES.SKILL_ITEM_CHAT_MESSAGE; }
  
  /**
   * @type {Attribute}
   */
  get relatedAttribute() {
    let _relatedAttribute = this.document.system.relatedAttribute;
    if (isBlankOrUndefined(_relatedAttribute) === true) {
      _relatedAttribute = ATTRIBUTES.agility.name;
    }
    return ATTRIBUTES[_relatedAttribute];
  }
  set relatedAttribute(value) {
    if (isObject(value)) { // This assumes an `Attribute` object was given. 
      this.document.system.relatedAttribute = value.name;
      this.updateByPath("system.relatedAttribute", value.name);
    } else { // This assumes a String was given. 
      this.document.system.relatedAttribute = value;
      this.updateByPath("system.relatedAttribute", value);
    }
  }
  
  /**
   * @type {String}
   */
  get category() {
    return this.document.system.category;
  }
  set category(value) {
    this.document.system.category = value;
    this.updateByPath("system.category", value);
  }
  
  /**
   * @type {Number}
   */
  get level() {
    return parseInt(this.document.system.level);
  }
  set level(value) {
    this.document.system.level = value;
    this.updateByPath("system.level", value);
  }
  
  /**
   * @type {Number}
   */
  get levelModifier() {
    return parseInt(this.document.system.levelModifier ?? "0");
  }
  set levelModifier(value) {
    this.document.system.levelModifier = value;
    this.updateByPath("system.levelModifier", value);
  }
  
  /**
   * @type {Number}
   * @readonly
   */
  get modifiedLevel() { return (this.level + this.levelModifier); }

  /**
   * @type {LevelAdvancement}
   */
  get advancementProgress() {
    const thiz = this;
    return {
      get successes() { return parseInt(thiz.document.system.successes); },
      set successes(value) {
        thiz.document.system.successes = value;
        thiz.updateByPath("system.successes", value);
      },
      get failures() { return parseInt(thiz.document.system.failures); },
      set failures(value) {
        thiz.document.system.failures = value;
        thiz.updateByPath("system.failures", value);
      },
    };
  }
  set advancementProgress(value) {
    this.document.system.successes = value.successes;
    this.document.system.failures = value.failures;
    this.update({
      system: {
        successes: value.successes,
        failures: value.failures
      }
    });
  }
  
  /**
   * @type {Boolean}
   */
  get isMagicSchool() {
    return arrayContains((this.document.system.properties ?? []), SKILL_PROPERTIES.MAGIC_SCHOOL.id);
  }
  set isMagicSchool(value) {
    const properties = (this.document.system.properties ?? []).concat([]); // Local-copy
    const index = properties.indexOf(SKILL_PROPERTIES.MAGIC_SCHOOL.id);

    if (value === true && index < 0) {
      properties.push(SKILL_PROPERTIES.MAGIC_SCHOOL.id);
      this.updateByPath("system.properties", properties);
    } else if (value !== true && index > -1) {
      properties.splice(index, 1);
      this.updateByPath("system.properties", properties);
    }
  }
  
  /** @override */
  get acceptedProperties() { return SKILL_PROPERTIES.asArray; }

  /**
   * @type {Array<SkillAbility>}
   */
  get abilities() {
    return this._abilities;
  }
  set abilities(value) {
    this._abilities = value;
    this.persistSkillAbilities();
  }
  
  /**
   * @type {SkillHeadState}
   */
  get headState() {
    if (this.document.system.headState === undefined) {
      return SKILL_HEAD_STATES.full;
    } else {
      return SKILL_HEAD_STATES.asArray.find(it => it.name === this.document.system.headState); 
    }
  }
  set headState(value) {
    this.document.system.headState = value.name;
    this.updateByPath("system.headState", value.name);
  }
  
  /**
   * @param {Item} document An encapsulated item instance. 
   * 
   * @throws {Error} Thrown, if `document` is `undefined`. 
   */
  constructor(document) {
    super(document);

    this.advancementRequirements = new Ruleset().getSkillAdvancementRequirements(this.level);
    this._abilities = this._getSkillAbilities();
  }

  /** @override */
  prepareData(context) {
    super.prepareData(context);

    context.system.relatedAttribute = context.system.relatedAttribute ?? "agility";
  }

  /** @override */
  async getChatData() {
    const vm = this.getChatViewModel();

    const renderedContent = await renderTemplate(this.chatMessageTemplate, {
      viewModel: vm,
    });

    return new PreparedChatData({
      renderedContent: renderedContent,
      actor: (this.owningDocument ?? {}).document, 
      sound: SOUNDS_CONSTANTS.NOTIFY,
      viewModel: vm,
      flavor: game.i18n.localize("ambersteel.character.skill.singular"),
    });
  }

  /** @override */
  getChatViewModel(overrides = {}) {
    return new SkillChatMessageViewModel({
      id: `${this.id}-${createUUID()}`,
      isEditable: false,
      isSendable: false,
      isOwner: this.isOwner,
      isGM: game.user.isGM,
      document: this,
      visGroupId: createUUID(),
      ...overrides,
    });
  }

  /**
   * Sets the given level of the skill. 
   * 
   * @param {Number | undefined} newLevel Value to set the skill to, e.g. `4`. 
   * * Default `0`
   * @param {Boolean | undefined} resetProgress If true, will also reset successes and failures. 
   * * Default `true`
   * 
   * @async
   */
  async setLevel(newLevel = 0, resetProgress = true) {
    this.level = newLevel;
    this.advancementRequirements = new Ruleset().getSkillAdvancementRequirements(newLevel);
    if (resetProgress === true) {
      this.advancementProgress.successes = 0;
      this.advancementProgress.failures = 0;
    }

    await this._persistLevel();
  };

  /**
   * Adds success/failure progress to the skill. 
   * 
   * Also auto-levels up the skill, if 'autoLevel' is set to true. 
   * 
   * @param {DiceOutcomeTypes} outcomeType The test outcome to work with. 
   * @param {Boolean | undefined} autoLevel Optional. If true, will auto-level up. 
   * * Default `false`
   * @param {Boolean | undefined} resetProgress Optional. If true, will also reset 
   * successes and failures, if `autoLevel` is also true and a level automatically 
   * incremented. 
   * * Default `true`
   * 
   * @throws {Error} Thrown, if `outcomeType` is undefined. 
   * 
   * @async
   */
  async addProgress(outcomeType, autoLevel = false, resetProgress = true) {
    if (outcomeType === undefined) {
      game.ambersteel.logger.logWarn("outcomeType is undefined");
      return;
    }
    if (outcomeType === DiceOutcomeTypes.NONE) {
      // Do not advance anything for a "none" result. 
      return;
    }

    if (outcomeType === DiceOutcomeTypes.SUCCESS) {
      this.advancementProgress.successes++;
    } else {
      this.advancementProgress.failures++;
    }

    if (autoLevel === true) {
      if (this.advancementProgress.successes >= this.advancementRequirements.successes
        && this.advancementProgress.failures >= this.advancementRequirements.failures) {
        this.level++;

        if (resetProgress === true) {
          this.advancementProgress.successes = 0;
          this.advancementProgress.failures = 0;
        }
      }
    }
    
    await this._persistLevel();

    // Progress associated attribute. 
    if (this.owningDocument !== undefined) {
      this.owningDocument.addAttributeProgress(outcomeType, this.relatedAttribute.name, autoLevel)
    }
  }

  /**
   * Adds a new skill ability. 
   * 
   * @param {Object} creationData Additional data to set on creation. 
   * 
   * @returns {SkillAbility} The newly created `SkillAbility` instance. 
   * 
   * @async
   */
  async createSkillAbility(creationData) {
    const newAbility = new SkillAbility({
      ...creationData,
      owningDocument: this,
      index: this.abilities.length,
    });
    
    this.abilities.push(newAbility);
    await this.updateByPath(`system.abilities.${newAbility.id}`, newAbility.toDto());
  }

  /**
   * Deletes the skill ability at the given index. 
   * 
   * @param id ID of the skill ability to delete. 
   * 
   * @returns {SkillAbility} The `SkillAbility` instance that was removed. 
   * 
   * @async
   */
  async deleteSkillAbility(id) {
    const toRemove = this.abilities.find(it => it.id === id);

    if (toRemove === undefined) {
      return undefined;
    }

    await this.deleteByPath(`system.abilities.${id}`);

    return toRemove;
  }

  /**
   * Advances the skill, based on the given `DicePoolResult`. 
   * 
   * @param {DicePoolResult | undefined} rollResult 
   * 
   * @async
   */
  async advanceByRollResult(rollResult) {
    if (rollResult !== undefined) {
      this.addProgress(rollResult.outcomeType);
    }
  }

  /**
   * Returns the component(s) to do a roll using this skill. 
   * 
   * @returns {SummedData}
   */
  getRollData() {
    if (this.headState.name === SKILL_HEAD_STATES.full.name) {
      const actor = (this.owningDocument ?? {}).document;
      const characterAttribute = new CharacterAttribute(actor, this.relatedAttribute.name);
      const compositionObj = new Ruleset().getSkillTestNumberOfDice(this.modifiedLevel, characterAttribute.modifiedLevel);
  
      return new SummedData(compositionObj.totalDiceCount, [
        new SummedDataComponent(this.relatedAttribute.name, characterAttribute.localizableName, compositionObj.attributeDiceCount),
        new SummedDataComponent(this.name, this.name, compositionObj.skillDiceCount),
      ]);
    } else if (this.headState.name === SKILL_HEAD_STATES.level_only.name) {
      return new SummedData(this.level, [
        new SummedDataComponent(this.name, this.name, this.level),
      ]);
    } else {
      return new SummedData(0, []);
    }
  }

  /**
   * Persists the current skill ability array to the data base. 
   * 
   * @param {Boolean | undefined} render If true, will trigger a re-render of the associated document sheet. 
   * * Default 'true'. 
   * 
   * @async
   */
  async persistSkillAbilities(render = true) {
    const abilitiesToPersist = {};

    for (const abilityId in this.abilities) {
      if (this.abilities.hasOwnProperty(abilityId) !== true) continue;

      const ability = this.abilities[abilityId];

      abilitiesToPersist[ability.id] = ability.toDto();
    }

    await this.updateByPath("system.abilities", abilitiesToPersist, render);
  }

  /**
   * Fetches the skill abilities from the underlying document and returns 
   * them, converted to "proper" objects. 
   * 
   * @returns {Array<SkillAbility>}
   * 
   * @private
   */
  _getSkillAbilities() {
    const abilitiesOnDocument = this.document.system.abilities;
      
    const result = [];
    for (const abilityId in abilitiesOnDocument) {
      if (abilitiesOnDocument.hasOwnProperty(abilityId) !== true) continue;

      const dto = abilitiesOnDocument[abilityId];

      const damage = [];
      for (const propertyName in dto.damage) {
        if (dto.damage.hasOwnProperty(propertyName) !== true) continue;

        const plainDamageObject = dto.damage[propertyName];

        damage.push(new DamageAndType({
          damage: plainDamageObject.damage ?? "0",
          damageType: DAMAGE_TYPES[plainDamageObject.damageType] ?? DAMAGE_TYPES.none,
        }));
      }

      const skillAbility = new SkillAbility({
        ...dto,
        owningDocument: this,
        damage: damage,
        attackType: ATTACK_TYPES[dto.attackType],
      });

      result.push(skillAbility);
    }
    return result;
  }
  
  /**
   * Persists the current level and advancement progress to the data base. 
   * 
   * @private
   * @async
   */
  async _persistLevel() {
    await this.document.update({
      system: {
        value: this.level,
        successes: this.advancementProgress.successes,
        failures: this.advancementProgress.failures
      }
    });
  }

  /**
   * Searches in: 
   * * Skill abilities
   * 
   * @override
   */
  _resolveReference(reference, comparableReference, propertyPath) {
    // Search skill ability.
    for (const ability of this.abilities) {
      const match = ability._resolveReference(reference, comparableReference, propertyPath);
      if (match !== undefined) {
        return match;
      }
    }
    
    return super._resolveReference(reference, comparableReference, propertyPath);
  }
}

ITEM_SUBTYPE.set("skill", (document) => { return new TransientSkill(document) });
