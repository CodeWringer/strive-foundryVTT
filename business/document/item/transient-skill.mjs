import { TEMPLATES } from "../../../presentation/template/templatePreloader.mjs";
import { createUUID } from "../../util/uuid-utility.mjs";
import SkillChatMessageViewModel from "../../../presentation/template/item/skill/skill-chat-message-viewmodel.mjs";
import { SummedData, SummedDataComponent } from "../../ruleset/skill/summed-data.mjs";
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
import { isObject } from "../../util/validation-utility.mjs";

/**
 * Represents the full transient data of a skill. 
 * 
 * @extends TransientBaseItem
 * 
 * @property {LevelAdvancement} advancementRequirements The current requirements 
 * to advance the skill. 
 * @property {LevelAdvancement} advancementProgress The current progress towards 
 * advancing the skill. 
 * @property {Number} level The current level of the skill. 
 * @property {Attribute} relatedAttribute The attribute that serves as the basis 
 * for this skill. 
 * @property {Array<SkillAbility>} abilities The array of skill abilities of this skill. 
 * @property {Boolean} isMagicSchool Returns true, if the skill is considered 
 * a magic school. 
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
    return ATTRIBUTES[this.document.data.data.relatedAttribute];
  }
  set relatedAttribute(value) {
    if (isObject(value)) { // This assumes an `Attribute` object was given. 
      this.document.data.data.relatedAttribute = value.name;
      this.updateSingle("data.data.relatedAttribute", value.name);
    } else { // This assumes a String was given. 
      this.document.data.data.relatedAttribute = value;
      this.updateSingle("data.data.relatedAttribute", value);
    }
  }
  
  /**
   * @type {String}
   */
  get category() {
    return this.document.data.data.category;
  }
  set category(value) {
    this.document.data.data.category = value;
    this.updateSingle("data.data.category", value);
  }
  
  /**
   * @type {Number}
   */
  get level() {
    return parseInt(this.document.data.data.level);
  }
  set level(value) {
    this.document.data.data.level = value;
    this.updateSingle("data.data.level", value);
  }
  
  /**
   * @type {LevelAdvancement}
   */
  get advancementProgress() {
    const thiz = this;
    return {
      get successes() { return parseInt(thiz.document.data.data.successes); },
      set successes(value) {
        thiz.update({
          data: {
            successes: value,
          }
        }); 
      },
      get failures() { return parseInt(thiz.document.data.data.failures); },
      set failures(value) {
        thiz.update({
          data: {
            failures: value,
          }
        }); 
      },
    };
  }
  set advancementProgress(value) {
    this.document.data.data.successes = value.successes;
    this.document.data.data.failures = value.failures;
    this.update({
      data: {
        successes: value.successes,
        failures: value.failures
      }
    });
  }
  
  /**
   * @type {Boolean}
   */
  get isMagicSchool() {
    return this.document.data.data.isMagicSchool;
  }
  set isMagicSchool(value) {
    this.document.data.data.isMagicSchool = value;
    this.updateSingle("data.data.isMagicSchool", value);
  }
  
  /**
   * @type {Boolean}
   */
  get abilities() {
    return this._abilities;
  }
  set abilities(value) {
    this._abilities = value;
    this.updateSingle("data.data.abilities", value);
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

    context.data.data.relatedAttribute = context.data.data.relatedAttribute ?? "agility";
  }

  /** @override */
  async getChatData() {
    const vm = this.getChatViewModel();

    const renderedContent = await renderTemplate(this.chatMessageTemplate, {
      viewModel: vm,
    });

    return new PreparedChatData({
      renderedContent: renderedContent,
      actor: this.owningDocument.document, 
      sound: SOUNDS_CONSTANTS.NOTIFY,
      viewModel: vm,
      flavor: game.i18n.localize("ambersteel.character.skill.singular"),
    });
  }

  /** @override */
  getChatViewModel(overrides = {}) {
    return new SkillChatMessageViewModel({
      id: this.id,
      isEditable: this.isOwner,
      isSendable: this.isOwner || game.user.isGM,
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
    await this.persistSkillAbilities();
  }

  /**
   * Deletes the skill ability at the given index. 
   * 
   * @param index Index of the skill ability to delete. 
   * 
   * @returns {SkillAbility} The `SkillAbility` instance that was removed. 
   * 
   * @async
   */
  async deleteSkillAbilityAt(index) {
    const toRemove = this.abilities[index];

    this.abilities = this.abilities.slice(0, index).concat(this.abilities.slice(index + 1));
    await this.persistSkillAbilities();

    return toRemove;
  }

  /**
   * Advances the skill, based on the given `DicePoolResult`. 
   * 
   * @param {DicePoolResult} rollResult 
   * 
   * @async
   */
  async advanceBasedOnRollResult(rollResult) {
    if (rollResult === undefined) {
      game.ambersteel.logger.logWarn("rollResult is undefined");
      return;
    }
    this.addProgress(rollResult.outcomeType, false);
  }

  /**
   * Returns the component(s) to do a roll using this skill. 
   * 
   * @returns {SummedData}
   */
  getRollData() {
    const actor = this.owningDocument.document;
    const characterAttribute = new CharacterAttribute(actor, this.relatedAttribute.name);
    const compositionObj = new Ruleset().getSkillTestNumberOfDice(this.level, characterAttribute.level);

    return new SummedData(compositionObj.totalDiceCount, [
      new SummedDataComponent(this.relatedAttribute.name, characterAttribute.localizableName, compositionObj.attributeDiceCount),
      new SummedDataComponent(this.name, this.name, compositionObj.skillDiceCount),
    ]);
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
    const abilitiesToPersist = this.abilities.map(it => it.toDto());
    await this.updateSingle("data.abilities", abilitiesToPersist, render);
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
    const abilitiesOnDocument = this.document.data.data.abilities;

    const result = [];
    for (let i = 0; i < abilitiesOnDocument.length; i++) {
      const dto = abilitiesOnDocument[i];

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
        index: i,
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
      data: {
        value: this.level,
        successes: this.advancementProgress.successes,
        failures: this.advancementProgress.failures
      }
    });
  }
}

ITEM_SUBTYPE.set("skill", (document) => { return new TransientSkill(document) });
