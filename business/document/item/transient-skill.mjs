import { TEMPLATES } from "../../../presentation/templatePreloader.mjs";
import { createUUID } from "../../util/uuid-utility.mjs";
import SkillChatMessageViewModel from "../../../presentation/sheet/item/skill/skill-chat-message-viewmodel.mjs";
import { SumComponent, Sum } from "../../ruleset/summed-data.mjs";
import DamageAndType from "../../ruleset/skill/damage-and-type.mjs";
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
import { arrayContains } from "../../util/array-utility.mjs";
import * as ConstantsUtils from "../../util/constants-utility.mjs";
import { DICE_POOL_RESULT_TYPES } from "../../dice/dice-pool.mjs";
import SkillPrerequisite from "../../ruleset/skill/skill-prerequisite.mjs";
import { SKILL_TAGS } from "../../tags/system-tags.mjs";
import InputDropDownViewModel from "../../../presentation/component/input-dropdown/input-dropdown-viewmodel.mjs";
import { DataField } from "../data-field.mjs";
import ChoiceAdapter from "../../../presentation/component/input-choice/choice-adapter.mjs";
import ValueAdapter from "../../util/value-adapter.mjs";
import InputTextFieldViewModel from "../../../presentation/component/input-textfield/input-textfield-viewmodel.mjs";
import InputNumberSpinnerViewModel from "../../../presentation/component/input-number-spinner/input-number-spinner-viewmodel.mjs";
import InputTagsViewModel from "../../../presentation/component/input-tags/input-tags-viewmodel.mjs";
import SkillSheetPresenter from "../../../presentation/document/skill/skill-sheet-presenter.mjs";
import SkillChatMessagePresenter from "../../../presentation/document/skill/skill-chat-message-presenter.mjs";
import SkillListItemPresenter from "../../../presentation/document/skill/skill-list-item-presenter.mjs";

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
 * @property {DataField< Number >} progressSuccesses 
 * @property {DataField< Number >} progressFailures 
 * @property {DataField< Number >} level The current raw level. 
 * @property {DataField< Number >} levelModifier The current level modifier. This number can be negative. 
 * @property {DataField< Attribute >} relatedAttribute The attribute that serves as the basis 
 * for this skill. 
 * @property {DataField< String >} category 
 * @property {DataField< SkillHeadState >} headState The current degree of data fidelity to expose. 
 * @property {DataField< Array<SkillPrerequisite> >} prerequisites 
 * @property {DataField< Array<SkillAbility> >} abilities The array of skill abilities of this skill. 
 * @property {LevelAdvancement} advancementRequirements The current requirements 
 * to advance the skill. 
 * @property {LevelAdvancement} advancementProgress Convenience accessor for level 
 * @property {DataField< Number >} advancementProgress.successes 
 * @property {DataField< Number >} advancementProgress.failures 
 * advancement progress. 
 * @property {Number} modifiedLevel The current modified level. 
 * * Read-only. 
 * @property {Boolean} isMagicSchool Returns true, if the skill is considered 
 * a magic school. 
 */
export default class TransientSkill extends TransientBaseItem {
  /** @override */
  get defaultImg() { return "icons/svg/book.svg"; }
  
  /** @override */
  get chatMessageTemplate() { return TEMPLATES.SKILL_ITEM_CHAT_MESSAGE; }
  
  relatedAttribute = new DataField({
    document: this,
    dataPaths: ["system.relatedAttribute"],
    template: InputDropDownViewModel.TEMPLATE,
    defaultValue: ATTRIBUTES.agility.name,
    viewModelFunc: (parent, isOwner, isGM) => {
      return new InputDropDownViewModel({
        id: "relatedAttribute",
        parent: parent,
        localizedToolTip: game.i18n.localize("ambersteel.character.health.injury.limit.label"),
        iconHtml: '<a href="icons/svg/bones.svg"></a>',
        options: ATTRIBUTES.asChoices(),
        adapter: new ChoiceAdapter({
          toChoiceOption(obj) {
            if (isDefined(obj) === true) {
              return ATTRIBUTES.asChoices().find(it => it.value === obj.name);
            } else {
              return ATTRIBUTES.asChoices().find(it => it.value === "none");
            }
          },
          fromChoiceOption(option) {
            return ATTRIBUTES[option.value];
          }
        }),
      });
    },
    dtoAdapter: new ValueAdapter({
      from: (dto) => ATTRIBUTES[dto],
      to: (attribute) => attribute.name,
    }),
  });
  
  category = new DataField({
    document: this,
    dataPaths: ["system.category"],
    template: InputTextFieldViewModel.TEMPLATE,
    defaultValue: "",
    viewModelFunc: (parent, isOwner, isGM) => {
      return new InputTextFieldViewModel({
        id: "category",
        parent: parent,
        localizedToolTip: game.i18n.localize("ambersteel.general.category"),
        iconHtml: '<a href="icons/svg/bones.svg"></a>',
      });
    },
  });
  
  level = new DataField({
    document: this,
    dataPaths: ["system.level"],
    template: InputNumberSpinnerViewModel.TEMPLATE,
    defaultValue: 0,
    viewModelFunc: (parent, isOwner, isGM) => {
      return new InputNumberSpinnerViewModel({
        id: "level",
        parent: parent,
        localizedToolTip: game.i18n.localize("ambersteel.character.advancement.level"),
        iconHtml: '<a href="icons/svg/bones.svg"></a>',
        min: 0,
      });
    },
  });
  
  levelModifier = new DataField({
    document: this,
    dataPaths: ["system.levelModifier"],
    template: InputNumberSpinnerViewModel.TEMPLATE,
    defaultValue: 0,
    viewModelFunc: (parent, isOwner, isGM) => {
      return new InputNumberSpinnerViewModel({
        id: "levelModifier",
        parent: parent,
        localizedToolTip: game.i18n.localize("ambersteel.character.advancement.levelModifier"),
        iconHtml: '<a href="icons/svg/bones.svg"></a>',
      });
    },
  });

  progressSuccesses = new DataField({
    document: this,
    dataPaths: ["system.successes"],
    template: InputNumberSpinnerViewModel.TEMPLATE,
    defaultValue: 0,
    viewModelFunc: (parent, isOwner, isGM) => {
      return new InputNumberSpinnerViewModel({
        id: "progressSuccesses",
        parent: parent,
        localizedToolTip: game.i18n.localize("ambersteel.character.advancement.requirements.success.label"),
        iconHtml: `<span>${game.i18n.localize("ambersteel.character.advancement.requirements.success.abbreviation")}</span>`,
      });
    },
  });

  progressFailures = new DataField({
    document: this,
    dataPaths: ["system.failures"],
    template: InputNumberSpinnerViewModel.TEMPLATE,
    defaultValue: 0,
    viewModelFunc: (parent, isOwner, isGM) => {
      return new InputNumberSpinnerViewModel({
        id: "progressFailures",
        parent: parent,
        localizedToolTip: game.i18n.localize("ambersteel.character.advancement.requirements.failure.label"),
        iconHtml: `<span>${game.i18n.localize("ambersteel.character.advancement.requirements.failure.abbreviation")}</span>`,
      });
    },
  });

  headState = new DataField({
    document: this,
    dataPaths: ["system.headState"],
    template: InputDropDownViewModel.TEMPLATE,
    defaultValue: SKILL_HEAD_STATES.FULL,
    viewModelFunc: (parent, isOwner, isGM) => {
      return new InputDropDownViewModel({
        id: "headState",
        parent: parent,
        localizedToolTip: game.i18n.localize("ambersteel.character.advancement.requirements.failure.label"),
        iconHtml: `<span>${game.i18n.localize("ambersteel.character.advancement.requirements.failure.abbreviation")}</span>`,
        options: SKILL_HEAD_STATES.asChoices(),
        adapter: new ChoiceAdapter({
          toChoiceOption(obj) {
            return SKILL_HEAD_STATES.asChoices().find(it => it.value === obj.name);
          },
          fromChoiceOption(option) {
            return SKILL_HEAD_STATES[option.value];
          }
        })
      });
    },
    dtoAdapter: new ValueAdapter({
      from: (dto) => SKILL_HEAD_STATES[dto],
      to: (value) => value.name,
    }),
  });

  prerequisites = new DataField({
    document: this,
    dataPaths: ["system.prerequisites"],
    template: "", // TODO
    defaultValue: [],
    viewModelFunc: (parent, isOwner, isGM) => {
      // TODO
    },
    dtoAdapter: new ValueAdapter({
      from: (dto) => dto.map(it => SkillPrerequisite.fromDto(it)),
      to: (value) => value.map(it => it.toDto()),
    }),
  });
  
  abilities = new DataField({
    document: this,
    dataPaths: ["system.abilities"],
    template: "", // TODO
    defaultValue: [],
    viewModelFunc: (parent, isOwner, isGM) => {
      // TODO
    },
    dtoAdapter: new ValueAdapter({
      from: (dto) => {
        const array = [];
        for (const propertyName in dto) {
          if (dto.hasOwnProperty(propertyName) !== true) continue;
          
          array.push(SkillAbility.fromDto(dto[propertyName], this));
        }
        return array;
      },
      to: (value) => {
        const obj = {};
        for (const ability of value) {
          obj[ability.id] = ability.toDto();
        }
  
        return obj;
      },
    }),
  });

  /**
   * @type {Number}
   * @readonly
   */
  get modifiedLevel() {
    const level = this.level.get();
    const levelModifier = this.levelModifier.get();
    if (level > 0) {
      return Math.max(level + levelModifier, 1);
    } else {
      return Math.max(level + levelModifier, 0)
    }
  }

  /**
   * Convenience accessor for level advancement progress. 
   * 
   * @type {LevelAdvancement}
   */
  get advancementProgress() {
    const thiz = this;
    return {
      successes: thiz.successes,
      failures: thiz.failures,
    };
  }
  
  /**
   * @type {Boolean}
   */
  get isMagicSchool() {
    return arrayContains(this.tags.get(), SKILL_TAGS.MAGIC_SCHOOL.id);
  }
  /**
   * @param {Boolean} value
   */
  set isMagicSchool(value) {
    const tags = this.tags.get().concat([]); 
    const index = tags.indexOf(SKILL_TAGS.MAGIC_SCHOOL.id);

    if (value === true && index < 0) {
      tags.push(SKILL_TAGS.MAGIC_SCHOOL.id);
    } else if (value !== true && index > -1) {
      tags.splice(index, 1);
    }
    this.tags.set(tags);
  }
  
  /** @override */
  get acceptedTags() { return SKILL_TAGS.asArray(); }

  /**
   * @param {Item} document An encapsulated item instance. 
   * 
   * @throws {Error} Thrown, if `document` is `undefined`. 
   */
  constructor(document) {
    super(document);

    this.tags.viewModelFunc = (parent, isOwner, isGM) => {
      return new InputTagsViewModel({
        id: "tags",
        parent: parent,
        systemTags: SKILL_TAGS.asArray(),
      });
    }

    this.advancementRequirements = new Ruleset().getSkillAdvancementRequirements(this.level.get());

    this.sheetPresenter = new SkillSheetPresenter({ document: this });
    this.listItemPresenter = new SkillListItemPresenter({ document: this });
    this.chatMessagePresenter = new SkillChatMessagePresenter({ document: this });
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
    this.advancementRequirements = new Ruleset().getSkillAdvancementRequirements(newLevel);
    if (resetProgress === true) {
      await this._persistLevel(newLevel, 0, 0);
    } else {
      await this.level.set(newLevel);
    }
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

    let level = this.level.get();
    let successes = this.progressSuccesses.get();
    let failures = this.progressFailures.get();

    if (outcomeType === DICE_POOL_RESULT_TYPES.SUCCESS) {
      successes++;
    } else {
      failures++;
    }

    if (autoLevel === true) {
      if (successes >= this.advancementRequirements.successes
        && failures >= this.advancementRequirements.failures) {
        level++;

        if (resetProgress === true) {
          successes = 0;
          failures = 0;
        }
      }
    }
    
    await this._persistLevel(level, successes, failures);

    // Progress associated attribute. 
    if (this.owningDocument !== undefined) {
      this.owningDocument.addAttributeProgress(outcomeType, this.relatedAttribute.get().name, autoLevel)
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
    const abilities = this.abilities.get().concat([]);

    const newAbility = new SkillAbility({
      ...creationData,
      owningDocument: this,
      index: abilities.length,
    });
    
    abilities.push(newAbility);
    await this.abilities.set(abilities);
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
    const abilities = this.abilities.get().concat([]);
    const index = abilities.findIndex(it => it.id === id);

    if (index < 0) {
      return undefined;
    }

    const removed = abilities.splice(index, 1)[0];
    await this.abilities.set(abilities);
    return removed;
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
    const headState = this.headState.get();
    if (headState.name === SKILL_HEAD_STATES.FULL.name
      || headState.name === SKILL_HEAD_STATES.BASICS.name) {
      const actor = (this.owningDocument ?? {}).document;
      const characterAttribute = new CharacterAttribute(actor, this.relatedAttribute.get().name);
      const compositionObj = new Ruleset().getSkillTestNumberOfDice(this.modifiedLevel, characterAttribute.modifiedLevel);
  
      return new Sum([
        new SumComponent(this.relatedAttribute.get().name, characterAttribute.localizableName, compositionObj.attributeDiceCount),
        new SumComponent(this.name.get(), this.name.get(), compositionObj.skillDiceCount),
      ]);
    } else if (headState.name === SKILL_HEAD_STATES.LEVEL_ONLY.name) {
      return new Sum([
        new SumComponent(this.name.get(), this.name.get(), this.level.get()),
      ]);
    } else {
      return new Sum();
    }
  }
  
  /**
   * Updates the level and the progress successes and failures in bulk. 
   * 
   * @param {Number} level
   * @param {Number} successes
   * @param {Number} failures
   * 
   * @private
   * @async
   */
  async _persistLevel(level, successes, failures) {
    await this.document.update({
      system: {
        value: level,
        successes: successes,
        failures: failures
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
    const abilities = this.abilities.get();
    for (const ability of abilities) {
      const match = ability._resolveReference(reference, comparableReference, propertyPath);
      if (match !== undefined) {
        return match;
      }
    }
    
    return super._resolveReference(reference, comparableReference, propertyPath);
  }
}

ITEM_SUBTYPE.set("skill", (document) => { return new TransientSkill(document) });
