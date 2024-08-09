import { createUUID } from "../../../util/uuid-utility.mjs";
import SkillChatMessageViewModel from "../../../../presentation/sheet/item/skill/skill-chat-message-viewmodel.mjs";
import DamageAndType from "../../../ruleset/skill/damage-and-type.mjs";
import PreparedChatData from "../../../../presentation/chat/prepared-chat-data.mjs";
import { SOUNDS_CONSTANTS } from "../../../../presentation/audio/sounds.mjs";
import TransientBaseItem from "../transient-base-item.mjs";
import LevelAdvancement from "../../../ruleset/level-advancement.mjs";
import Ruleset from "../../../ruleset/ruleset.mjs";
import Expertise from "./expertise.mjs";
import { ATTACK_TYPES } from "../../../ruleset/skill/attack-types.mjs";
import { ATTRIBUTES, Attribute } from "../../../ruleset/attribute/attributes.mjs";
import { isDefined } from "../../../util/validation-utility.mjs";
import SkillPrerequisite from "../../../ruleset/skill/skill-prerequisite.mjs";
import { SKILL_TAGS } from "../../../tags/system-tags.mjs";
import AtReferencer from "../../../referencing/at-referencer.mjs";
import { ACTOR_TYPES } from "../../actor/actor-types.mjs";
import { getExtenders } from "../../../../common/extender-util.mjs";

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
 * @property {Array<Attribute>} baseAttributes Base attributes of the skill. 
 * * Must always contain at least one entry. By default, this is the first attribute as per the `ATTRIBUTES` definiton. 
 * @property {Array<Expertise>} expertises The array of expertises of this skill. 
 * @property {Number | undefined} apCost 
 * @property {Array<DamageAndType>} damage
 * @property {String | undefined} condition 
 * @property {Number | undefined} distance 
 * @property {String | undefined} obstacle 
 * @property {String | undefined} opposedBy 
 * @property {AttackType | undefined} attackType 
 * @property {Boolean} advanced 
 */
export default class TransientSkill extends TransientBaseItem {
  /** @override */
  get defaultImg() { return "icons/svg/book.svg"; }
  
  /** @override */
  get chatMessageTemplate() { return game.strive.const.TEMPLATES.SKILL_ITEM_CHAT_MESSAGE; }
  
  /** @override */
  get nameForDisplay() { return `${this.document.name} (${this.baseAttributes.map(it => game.i18n.localize(it.localizableAbbreviation)).join("/")})`; }
  
  /**
   * @type {Array<Attribute>}
   */
  get baseAttributes() {
    const baseAttributeNames = this.document.system.baseAttributes ?? [];
    const attributes = baseAttributeNames
      .map(attributeName => ATTRIBUTES[attributeName])
      .filter(it => isDefined(it));
    
    // Safe-guard - there must always be at least one base attribute. 
    if (attributes.length === 0) {
      attributes.push(ATTRIBUTES.asArray()[0]);
    }

    return attributes;
  }
  /**
   * Sets the given list of base attributes. 
   * 
   * @param {Array<Attribute>} value
   */
  set baseAttributes(value) {
    const baseAttributeNames = value.map(attribute => attribute.name);
    this.document.system.baseAttributes = baseAttributeNames;

    this.updateByPath("system.baseAttributes", baseAttributeNames);
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
    const level = this.dependsOnActiveCr === true ? (this.owningDocument.challengeRating.modified) : this.level;

    if (level > 0) {
      return Math.max(level + this.levelModifier, 1);
    } else {
      return Math.max(level + this.levelModifier, 0)
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
  
  /** @override */
  get acceptedTags() { return SKILL_TAGS.asArray(); }

  /**
   * @type {Array<Expertise>}
   */
  get expertises() {
    return this._expertises;
  }
  set expertises(value) {
    this._expertises = value;
    this.persistExpertises();
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
   * @type {Boolean}
   */
  get advanced() {
    return this.document.system.advanced ?? false;
  }
  /**
   * @param {Boolean} value
   */
  set advanced(value) {
    this.updateByPath("system.advanced", value);
  }

  /**
   * Returns `true`, if the skill's embedded on an actor for which 
   * a challenge rating is active. 
   * 
   * @type {Boolean}
   * @readonly
   */
  get dependsOnActiveCr() {
    const owningDocument = this.owningDocument;
    if (isDefined(owningDocument) 
      && owningDocument.type === ACTOR_TYPES.NPC
      && owningDocument.isChallengeRatingEnabled) {
      return true;
    } else {
      return false;
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
    this._expertises = this._getExpertises();
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
      flavor: game.i18n.localize("system.character.skill.singular"),
    });
  }

  /**
   * Returns an instance of a view model for use in a chat message. 
   * 
   * @param {Object | undefined} overrides Optional. An object that allows overriding any of the view model properties. 
   * @param {ViewModel | undefined} overrides.parent A parent view model instance. 
   * In case this is an embedded document, such as an expertise, this value must be supplied 
   * for proper function. 
   * @param {String | undefined} overrides.id
   * * default is a new UUID.
   * @param {Boolean | undefined} overrides.isEditable
   * * default `false`
   * @param {Boolean | undefined} overrides.isSendable
   * * default `false`
   * @param {Boolean | undefined} overrides.showParentSkill Optional. If true, will show the parent skill name and icon, if possible. 
   * * default `true`
   * 
   * @returns {ExpertiseChatMessageViewModel}
   * 
   * @override
   */
  getChatViewModel(overrides = {}) {
    return new SkillChatMessageViewModel({
      id: overrides.id,
      parent: overrides.parent,
      isEditable: overrides.isEditable ?? false,
      isSendable: overrides.isSendable ?? false,
      isOwner: this.isOwner,
      isGM: game.user.isGM,
      document: this,
      visGroupId: createUUID(),
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
   * Adds a new expertise. 
   * 
   * @param {Object} creationData Additional data to set on creation. 
   * 
   * @returns {Expertise} The newly created `Expertise` instance. 
   * 
   * @async
   */
  async createExpertise(creationData) {
    const newExpertise = new Expertise({
      ...creationData,
      owningDocument: this,
      index: this.expertises.length,
    });
    
    this.expertises.push(newExpertise);
    await this.updateByPath(`system.abilities.${newExpertise.id}`, newExpertise.toDto());

    return newExpertise;
  }

  /**
   * Deletes the expertise at the given index. 
   * 
   * @param id ID of the expertise to delete. 
   * 
   * @returns {Expertise} The `Expertise` instance that was removed. 
   * 
   * @async
   */
  async deleteExpertise(id) {
    const toRemove = this.expertises.find(it => it.id === id);

    if (toRemove === undefined) {
      return undefined;
    }

    await this.deleteByPath(`system.abilities.${id}`);

    return toRemove;
  }

  /**
   * Persists the current expertise array to the data base. 
   * 
   * @param {Boolean | undefined} render If true, will trigger a re-render of the associated document sheet. 
   * * Default 'true'. 
   * 
   * @async
   */
  async persistExpertises(render = true) {
    const expertisesToPersist = {};

    for (const expertise of this.expertises) {
      expertisesToPersist[expertise.id] = expertise.toDto();
    }

    await this.updateByPath("system.abilities", expertisesToPersist, render);
  }

  /**
   * Compares the raw level of this instance with a given instance and returns a numeric comparison result. 
   * 
   * @param {TransientSkill} other Another instance to compare with. 
   * 
   * @returns {Number} `-1` | `0` | `1`
   * 
   * `-1` means that this entity is less than / smaller than `other`, while `0` means equality and `1` means it 
   * is more than / greater than `other`. 
   */
  compareLevel(other) {
    if (this.level < other.level) {
      return -1;
    } else if (this.level > other.level) {
      return 1;
    } else {
      return 0;
    }
  }

  /**
   * Fetches the expertises from the underlying document and returns 
   * them, converted to "proper" objects. 
   * 
   * @returns {Array<Expertise>}
   * 
   * @private
   */
  _getExpertises() {
    const expertisesOnDocument = this.document.system.abilities;
      
    const result = [];
    for (const expertiseId in expertisesOnDocument) {
      if (expertisesOnDocument.hasOwnProperty(expertiseId) !== true) continue;

      const dto = expertisesOnDocument[expertiseId];
      result.push(Expertise.fromDto(dto, this));
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
   * @override
   * 
   * Also searches in: 
   * * Embedded expertises
   */
  resolveReference(comparableReference, propertyPath) {
    const collectionsToSearch = [
      this.expertises,
    ];
    const r = new AtReferencer().resolveReferenceInCollections(collectionsToSearch, comparableReference, propertyPath);
    if (r !== undefined) {
      return r;
    }

    return super.resolveReference(comparableReference, propertyPath);
  }
  
  /** @override */
  getExtenders() {
    return super.getExtenders().concat(getExtenders(TransientSkill));
  }
}
