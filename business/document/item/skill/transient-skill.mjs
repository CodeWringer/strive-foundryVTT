import { TEMPLATES } from "../../../../presentation/templatePreloader.mjs";
import { createUUID } from "../../../util/uuid-utility.mjs";
import SkillChatMessageViewModel from "../../../../presentation/sheet/item/skill/skill-chat-message-viewmodel.mjs";
import { SumComponent, Sum } from "../../../ruleset/summed-data.mjs";
import DamageAndType from "../../../ruleset/skill/damage-and-type.mjs";
import PreparedChatData from "../../../../presentation/chat/prepared-chat-data.mjs";
import { DAMAGE_TYPES } from "../../../ruleset/damage-types.mjs";
import { SOUNDS_CONSTANTS } from "../../../../presentation/audio/sounds.mjs";
import { ITEM_SUBTYPE } from "../item-subtype.mjs";
import TransientBaseItem from "../transient-base-item.mjs";
import LevelAdvancement from "../../../ruleset/level-advancement.mjs";
import Ruleset from "../../../ruleset/ruleset.mjs";
import SkillAbility from "./skill-ability.mjs";
import CharacterAttribute from "../../../ruleset/attribute/character-attribute.mjs";
import { ATTACK_TYPES } from "../../../ruleset/skill/attack-types.mjs";
import { ATTRIBUTES, Attribute } from "../../../ruleset/attribute/attributes.mjs";
import { isBlankOrUndefined, isDefined, isObject } from "../../../util/validation-utility.mjs";
import { arrayContains } from "../../../util/array-utility.mjs";
import * as ConstantsUtils from "../../../util/constants-utility.mjs";
import { DICE_POOL_RESULT_TYPES } from "../../../dice/dice-pool.mjs";
import SkillPrerequisite from "../../../ruleset/skill/skill-prerequisite.mjs";
import { SKILL_TAGS } from "../../../tags/system-tags.mjs";
import AtReferencer from "../../../referencing/at-referencer.mjs";

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
  FULL: new SkillHeadState({
    name: "full",
    localizableName: "ambersteel.character.skill.headStates.full",
  }),
  BASICS: new SkillHeadState({
    name: "basics",
    localizableName: "ambersteel.character.skill.headStates.basics",
  }),
  LEVEL_ONLY: new SkillHeadState({
    name: "level_only",
    localizableName: "ambersteel.character.skill.headStates.level_only",
  }),
  HEADLESS: new SkillHeadState({
    name: "headless",
    localizableName: "ambersteel.character.skill.headStates.headless",
  }),
}
ConstantsUtils.enrichConstant(SKILL_HEAD_STATES);

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
 * 
 * @property {Number | undefined} apCost 
 * @property {Array<DamageAndType>} damage
 * @property {String | undefined} condition 
 * @property {Number | undefined} distance 
 * @property {String | undefined} obstacle 
 * @property {String | undefined} opposedBy 
 * @property {AttackType | undefined} attackType 
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
  get modifiedLevel() {
    if (this.level > 0) {
      return Math.max(this.level + this.levelModifier, 1);
    } else {
      return Math.max(this.level + this.levelModifier, 0)
    }
  }

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
        failures: value.failures,
      }
    });
  }
  
  /**
   * @type {Boolean}
   */
  get isMagicSchool() {
    return arrayContains(((this.document.system.tags ?? this.document.system.properties) ?? []), SKILL_TAGS.MAGIC_SCHOOL.id);
  }
  set isMagicSchool(value) {
    const tags = ((this.document.system.tags ?? this.document.system.properties) ?? []).concat([]); 
    const index = tags.indexOf(SKILL_TAGS.MAGIC_SCHOOL.id);

    if (value === true && index < 0) {
      tags.push(SKILL_TAGS.MAGIC_SCHOOL.id);
      this.updateByPath("system.tags", tags);
    } else if (value !== true && index > -1) {
      tags.splice(index, 1);
      this.updateByPath("system.tags", tags);
    }
  }
  
  /** @override */
  get acceptedTags() { return SKILL_TAGS.asArray(); }

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
      return SKILL_HEAD_STATES.FULL;
    } else {
      return SKILL_HEAD_STATES.asArray().find(it => it.name === this.document.system.headState); 
    }
  }
  set headState(value) {
    this.document.system.headState = value.name;
    this.updateByPath("system.headState", value.name);
  }

  /**
   * Returns the list of prerequisite skills. 
   * 
   * @type {Array<SkillPrerequisite>}
   */
  get prerequisites() {
    if (this.document.system.prerequisites === undefined) {
      return [];
    } else {
      return this.document.system.prerequisites.map(dto => 
        SkillPrerequisite.fromDto(dto)
      ); 
    }
  }
  /**
   * Sets the list of prerequisite skills. 
   * 
   * @param {Array<SkillPrerequisite>} value
   */
  set prerequisites(value) {
    this.updateByPath("system.prerequisites", value.map(it => it.toDto()));
  }

  get apCost() {
    const value = this.document.system.apCost;
    if (isDefined(value)) {
      return value;
    } else {
      return undefined;
    }
  }
  set apCost(value) {
    if (isDefined(value)) {
      this.updateByPath("system.apCost", value);
    } else {
      this.updateByPath("system.apCost", null);
    }
  }

  get damage() {
    return (this.document.system.damage ?? []).map(dto => 
      DamageAndType.fromDto(dto)
    );
  }
  set damage(value) {
    this.updateByPath("system.damage", value.map(it => it.toDto()));
  }
  
  get condition() {
    const value = this.document.system.condition;
    if (isDefined(value)) {
      return value;
    } else {
      return undefined;
    }
  }
  set condition(value) {
    if (isDefined(value)) {
      this.updateByPath("system.condition", value);
    } else {
      this.updateByPath("system.condition", null);
    }
  }
  
  get distance() {
    const value = this.document.system.distance;
    if (isDefined(value)) {
      return value;
    } else {
      return undefined;
    }
  }
  set distance(value) {
    if (isDefined(value)) {
      this.updateByPath("system.distance", value);
    } else {
      this.updateByPath("system.distance", null);
    }
  }
  
  get obstacle() {
    const value = this.document.system.obstacle;
    if (isDefined(value)) {
      return value;
    } else {
      return undefined;
    }
  }
  set obstacle(value) {
    if (isDefined(value)) {
      this.updateByPath("system.obstacle", value);
    } else {
      this.updateByPath("system.obstacle", null);
    }
  }
  
  get opposedBy() {
    const value = this.document.system.opposedBy;
    if (isDefined(value)) {
      return value;
    } else {
      return undefined;
    }
  }
  set opposedBy(value) {
    if (isDefined(value)) {
      this.updateByPath("system.opposedBy", value);
    } else {
      this.updateByPath("system.opposedBy", null);
    }
  }
  
  get attackType() {
    const value = this.document.system.attackType;
    if (isDefined(value)) {
      return ATTACK_TYPES[value];
    } else {
      return undefined;
    }
  }
  set attackType(value) {
    if (isDefined(value)) {
      this.updateByPath("system.attackType", value.name);
    } else {
      this.updateByPath("system.attackType", null);
    }
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
   * @param {DicePoolRollResultType} outcomeType The test outcome to work with. 
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
    if (outcomeType === DICE_POOL_RESULT_TYPES.NONE) {
      // Do not advance anything for a "none" result. 
      return;
    }

    if (outcomeType === DICE_POOL_RESULT_TYPES.SUCCESS) {
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

    return newAbility;
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
   * Advances the skill, based on the given `DicePoolRollResult`. 
   * 
   * @param {DicePoolRollResult | undefined} rollResult 
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
   * @returns {Sum}
   */
  getRollData() {
    if (this.headState.name === SKILL_HEAD_STATES.FULL.name
      || this.headState.name === SKILL_HEAD_STATES.BASICS.name) {
      const actor = (this.owningDocument ?? {}).document;
      const characterAttribute = new CharacterAttribute(actor, this.relatedAttribute.name);
      const compositionObj = new Ruleset().getSkillTestNumberOfDice(this.modifiedLevel, characterAttribute.modifiedLevel);
  
      return new Sum([
        new SumComponent(this.relatedAttribute.name, characterAttribute.localizableName, compositionObj.attributeDiceCount),
        new SumComponent(this.name, this.name, compositionObj.skillDiceCount),
      ]);
    } else if (this.headState.name === SKILL_HEAD_STATES.LEVEL_ONLY.name) {
      return new Sum([
        new SumComponent(this.name, this.name, this.level),
      ]);
    } else {
      return new Sum();
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

    for (const ability of this.abilities) {
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
      result.push(SkillAbility.fromDto(dto, this));
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
   * Tries to resolve the given reference in the embedded documents of 
   * this document. 
   * 
   * Searches in: 
   * * Embedded fate-cards.
   * 
   * This method will be called implicitly, by an `AtReferencer`, when it tries 
   * to resolve a reference on *this* document. 
   * 
   * @param {String} comparableReference A comparable version of a reference. 
   * * Comparable in the sense that underscores "_" are replaced with spaces " " 
   * or only the last piece of a property path is returned. 
   * * E. g. `"@Heavy_Armor"` -> `"@heavy armor"`
   * * E. g. `"@A.B.c"` -> `"a"`
   * @param {String | undefined} propertyPath If not undefined, a property path on 
   * the referenced object. 
   * * E. g. `"@A.B.c"` -> `"B.c"`
   * 
   * @returns {Any | undefined} The matched reference or undefined, 
   * if no match was found. 
   */
  resolveReference(comparableReference, propertyPath) {
    const collectionsToSearch = [
      this.abilities,
    ];
    return new AtReferencer().resolveReferenceInCollections(collectionsToSearch, comparableReference, propertyPath);
  }
}

ITEM_SUBTYPE.set("skill", (document) => { return new TransientSkill(document) });