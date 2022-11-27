import AmbersteelBaseItem from "./ambersteel-base-item.mjs";
import SkillAbility from "../../../dto/skill-ability.mjs";
import { TEMPLATES } from "../../../templatePreloader.mjs";
import { createUUID } from "../../../utils/uuid-utility.mjs";
import SkillChatMessageViewModel from "../../../../templates/item/skill/skill-chat-message-viewmodel.mjs";
import { SummedData, SummedDataComponent } from "../../../dto/summed-data.mjs";
import DamageAndType from "../../../dto/damage-and-type.mjs";
import { DiceOutcomeTypes } from "../../../dto/dice-outcome-types.mjs";
import PreparedChatData from "../../../dto/prepared-chat-data.mjs";
import Ruleset from "../../../ruleset.mjs";
import { DAMAGE_TYPES } from "../../../constants/damage-types.mjs";

export default class AmbersteelSkillItem extends AmbersteelBaseItem {
  /** @override */
  get defaultImg() { return "icons/svg/book.svg"; }
  
  /** @override */
  get chatMessageTemplate() { return TEMPLATES.SKILL_ITEM_CHAT_MESSAGE; }
  
  /**
   * Ensures type-specific methods and properties are added to the given 
   * context entity. 
   * @param {Actor} context 
   * @virtual
   * @private
   */
  _ensureContextHasSpecifics(context) {
    context.setLevel = this.setLevel.bind(context);
    context.addSkillProgress = this.addSkillProgress.bind(context);
    context.createSkillAbility = this.createSkillAbility.bind(context);
    context.deleteSkillAbilityAt = this.deleteSkillAbilityAt.bind(context);
    context.advanceSkillBasedOnRollResult = this.advanceSkillBasedOnRollResult.bind(context);
    context.getChatData = this.getChatData.bind(context);
    context.getChatViewModel = this.getChatViewModel.bind(context);
    context.getRollData = this._getRollData.bind(context);
  }

  /** @override */
  prepareData(context) {
    super.prepareData(context);

    this._ensureContextHasSpecifics(context);

    context.data.data.relatedAttribute = context.data.data.relatedAttribute ?? "agility";
  }

  /** @override */
  prepareDerivedData(context) {
    super.prepareDerivedData(context);

    this._ensureContextHasSpecifics(context);

    this._ensureSkillAbilityObjects(context);
  }

  /**
   * Returns data for a chat message, based on this injury. 
   * @returns {PreparedChatData}
   * @override
   * @async
   */
  async getChatData() {
    const actor = this.parent ?? this.actor;
    const vm = this.getChatViewModel();

    const renderedContent = await renderTemplate(this.chatMessageTemplate, {
      viewModel: vm,
    });

    return new PreparedChatData({
      renderedContent: renderedContent,
      actor: actor, 
      sound: "../sounds/notify.wav",
      viewModel: vm,
      flavor: game.i18n.localize("ambersteel.character.skill.singular"),
    });
  }

  /** @override */
  getChatViewModel(overrides = {}) {
    return new SkillChatMessageViewModel({
      id: this.id,
      isEditable: this.isEditable,
      isSendable: this.isSendable,
      isOwner: this.isOwner,
      isGM: this.isGM,
      item: this,
      actor: this.parent ?? this.actor,
      visGroupId: createUUID(),
      ...overrides,
    });
  }

  /**
   * Sets the given level of the skill. 
   * 
   * @param newLevel {Number} Value to set the skill to, e.g. 0. Default 0
   * @param resetProgress {Boolean} If true, will also reset successes and failures. Default true
   * @async
   */
  async setLevel(newLevel = 0, resetProgress = true) {
    const req = new Ruleset().getSkillAdvancementRequirements(newLevel);

    await this.update({
      data: {
        value: newLevel,
        requiredSuccessses: req.requiredSuccessses,
        requiredFailures: req.requiredFailures,
        successes: resetProgress ? 0 : this.data.data.successes,
        failures: resetProgress ? 0 : this.data.data.failures
      }
    });
  };

  /**
   * Adds success/failure progress to the skill. 
   * 
   * Also auto-levels up the skill, if 'autoLevel' is set to true. 
   * @param {DiceOutcomeTypes} outcomeType The test outcome to work with. 
   * @param {Boolean | undefined} autoLevel Optional. If true, will auto-level up. Default false
   * @param {Boolean | undefined} resetProgress Optional. If true, will also reset successes and failures,
   * if 'autoLevel' is also true and a level automatically incremented. Default true
   * @async
   */
  async addSkillProgress(outcomeType, autoLevel = false, resetProgress = true) {
    if (outcomeType === undefined) {
      game.ambersteel.logger.logWarn("outcomeType is undefined");
      return;
    }

    const skillData = this.data.data;

    let successes = parseInt(skillData.successes);
    let failures = parseInt(skillData.failures);
    const requiredSuccessses = parseInt(skillData.requiredSuccessses);
    const requiredFailures = parseInt(skillData.requiredFailures);

    if (outcomeType === DiceOutcomeTypes.SUCCESS) {
      successes++;
      await this.updateProperty("data.successes", successes);
    } else if (outcomeType === DiceOutcomeTypes.FAILURE || outcomeType === DiceOutcomeTypes.PARTIAL) {
      failures++;
      await this.updateProperty("data.failures", failures);
    }

    if (autoLevel) {
      if (successes >= requiredSuccessses
        && failures >= requiredFailures) {
        const nextSkillValue = parseInt(skillData.value) + 1;
        await this.setLevel(nextSkillValue, resetProgress);
      }
    }

    // Progress associated attribute. 
    const attName = skillData.relatedAttribute;
    this.parent.addAttributeProgress(outcomeType, attName, autoLevel)
  }

  /**
   * Adds a new skill ability. 
   * @param {Object} creationData Additional data to set on creation. 
   */
  async createSkillAbility(creationData) {
    const newAbility = new SkillAbility({
      owner: this,
      index: this.data.data.abilities.length,
    });
    
    for (const propertyName in creationData) {
      newAbility[propertyName] = creationData[propertyName];
    }

    const abilities = this.data.data.abilities.concat(
      [newAbility]
    );
    await this.updateProperty("data.abilities", abilities);
  }

  /**
   * Deletes the skill ability at the given index. 
   * @param index Index of the skill ability to delete. 
   */
  async deleteSkillAbilityAt(index) {
    const dataAbilities = this.data.data.abilities;
    const abilities = dataAbilities.slice(0, index).concat(dataAbilities.slice(index + 1));
    await this.updateProperty("data.abilities", abilities);
  }
  
  /**
   * Advances the skill, based on the given {DicePoolResult}. 
   * @param {DicePoolResult} rollResult 
   * @async
   */
  async advanceSkillBasedOnRollResult(rollResult) {
    if (rollResult === undefined) {
      game.ambersteel.logger.logWarn("rollResult is undefined");
      return;
    }
    this.addSkillProgress(rollResult.outcomeType, false);
  }

  /**
   * @private
   * @returns {SummedData}
   */
  _getRollData() {
    const relatedAttributeName = this.data.data.relatedAttribute;
    const attGroupName = new Ruleset().getAttributeGroupName(relatedAttributeName);
    
    const actor = this.parent;
    const relatedAttributeLevel = actor ? actor.data.data.attributes[attGroupName][relatedAttributeName].value : 0;

    const skillLevel = this.data.data.value;

    const compositionObj = new Ruleset().getSkillTestNumberOfDice(skillLevel, relatedAttributeLevel);

    return new SummedData(compositionObj.totalDiceCount, [
      new SummedDataComponent(relatedAttributeName, `ambersteel.character.attribute.${relatedAttributeName}.label`, compositionObj.attributeDiceCount),
      new SummedDataComponent(this.name, this.name, compositionObj.skillDiceCount),
    ]);
  }

  /**
   * Ensures that all objects under context.data.data.abilities are 'proper' SkillAbility type objects. 
   * @param {AmbersteelItem} context 
   * @private
   */
  _ensureSkillAbilityObjects(context) {
    const skillAbilities = [];
    for (let i = 0; i < context.data.data.abilities.length; i++) {
      const abilityObject = context.data.data.abilities[i];

      const damage = [];
      for (const propertyName in abilityObject.damage) {
        if (abilityObject.damage.hasOwnProperty(propertyName) !== true) continue;

        const plainDamageObject = abilityObject.damage[propertyName];

        damage.push(new DamageAndType({
          damage: plainDamageObject.damage ?? "",
          damageType: plainDamageObject.damageType ?? DAMAGE_TYPES.none.name,
        }));
      }

      const skillAbility = new SkillAbility({
        ...abilityObject,
        owner: context,
        index: i,
        damage: damage,
      });

      skillAbilities.push(skillAbility);
    }
    context.data.data.abilities = skillAbilities;
  }
}
