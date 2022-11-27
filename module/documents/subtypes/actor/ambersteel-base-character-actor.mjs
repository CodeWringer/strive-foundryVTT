import { DiceOutcomeTypes } from '../../../dto/dice-outcome-types.mjs';
import { SummedData, SummedDataComponent } from '../../../dto/summed-data.mjs';
import Ruleset from '../../../ruleset.mjs';
import { TEMPLATES } from '../../../templatePreloader.mjs';
import AmbersteelBaseActor from './ambersteel-base-actor.mjs';

export default class AmbersteelBaseCharacterActor extends AmbersteelBaseActor {
  /** @override */
  get defaultImg() { return "icons/svg/mystery-man.svg"; }
  
  /** @override */
  get chatMessageTemplate() { return TEMPLATES.ACTOR_CHAT_MESSAGE; }

  /**
   * Ensures type-specific methods and properties are added to the given 
   * context entity. 
   * @param {Actor} context 
   * @virtual
   * @private
   */
  _ensureContextHasSpecifics(context) {
    context.getInjuries = () => { return context.getItemsByType("injury"); }
    context.getIllnesses = () => { return context.getItemsByType("illness"); }
    context.getMutations = () => { return context.getItemsByType("mutation"); }
    context.getPossessions = () => {
      const items = Array.from(context.items);
      return items.filter((item) => { return item.type === "item" && item.data.data.isOnPerson; });
    }
    context.getPropertyItems = () => {
      const items = Array.from(context.items);
      return items.filter((item) => { return item.type === "item" && !item.data.data.isOnPerson; });
    }
    context.getAttributeForName = this.getAttributeForName.bind(context);
    context.setAttributeLevel = this.setAttributeLevel.bind(context);
    context.addAttributeProgress = this.addAttributeProgress.bind(context);
    context.advanceSkillBasedOnRollResult = this.advanceSkillBasedOnRollResult.bind(context);
    context.advanceAttributeBasedOnRollResult = this.advanceAttributeBasedOnRollResult.bind(context);
  }
  
  /** @override */
  prepareData(context) {
    super.prepareData(context);

    this._ensureContextHasSpecifics(context);
  }

  /** @override */
  prepareDerivedData(context) {
    super.prepareDerivedData(context);

    this._ensureContextHasSpecifics(context);

    context.data.data.assets.maxBulk = new Ruleset().getCharacterMaximumInventory(context);
    context.data.data.assets.totalBulk = this._calculateUsedBulk(context);
    this._prepareDerivedAttributesData(context);
    this._prepareDerivedSkillsData(context);
    this._prepareDerivedHealthData(context);
  }

  /**
   * Returns the currently used bulk. 
   * @param {AmbersteelActor} context 
   * @returns {Number} The currently used bulk. 
   * @private
   */
  _calculateUsedBulk(context) {
    let usedBulk = 0;
    for (const possession of context.getPossessions()) {
      usedBulk += possession.data.data.bulk;
    }
    return usedBulk;
  }

  /**
   * Prepares derived data for all attributes. 
   * 
   * This will adjust actor.data.data to the following result:
   * actor.data.data = {
   *   attributeGroups: {Array<Object>} = same as physical,
   *   attributes: {Object} = {
   *     physical: {Object} = {
   *       name: {String},
   *       localizableName: {String},
   *       localizableAbbreviation: {String},
   *       attributes: {Array<Object>} = {
   *         value: {Number},
   *         successes: {Number},
   *         failures: {Number},
   *         requiredSuccessses: {Number},
   *         requiredFailures: {Number},
   *         name: {String},
   *         localizableName: {String},
   *         localizableAbbreviation: {String},
   *         getRollData(): {Function<Object>}
   *         advanceAttributeBasedOnRollResult({DicePoolResult}, {String}): {Function<>}
   *       }
   *     },
   *     mental: {Object} = same as physical
   *     social: {Object} = same as physical
   *   }
   * }
   * 
   * @param {AmbersteelActor} context 
   * @private
   */
  _prepareDerivedAttributesData(context) {
    const actorData = context.data.data;

    // The names of the attribute groups to iterate. "physical", "mental" and "social"
    const attributeGroupNames = actorData.attributeGroupNames ?? this._getAttributeGroupNames(context);
    if (actorData.attributeGroupNames === undefined) {
      actorData.attributeGroupNames = attributeGroupNames;
    }
    
    const attributeGroups = [];
    for (const attGroup of attributeGroupNames) {
      const attGroupName = attGroup.name;
      const oAttGroup = actorData.attributes[attGroupName];
      
      // The names of the attributes to iterate. E. g. "agility" or "willpower"
      const attributeNames = attGroup.attributeNames;
      
      // Prepare attributes of group. 
      const attributes = [];
      for (const attName of attributeNames) {
        const oAtt = oAttGroup[attName];
        this._prepareDerivedAttributeData(context, oAtt, attName);
        attributes.push(oAtt);
      }

      // Add internal name. 
      oAttGroup.name = attGroupName;
      // Add localization keys. 
      oAttGroup.localizableName = `ambersteel.character.attributeGroup.${attGroupName}.label`;
      oAttGroup.localizableAbbreviation = `ambersteel.character.attributeGroup.${attGroupName}.abbreviation`;
      // Add attributes of group for easy access. 
      oAttGroup.attributes = attributes;

      attributeGroups.push(oAttGroup);
    }
    // Add attribute groups for easy access. 
    actorData.attributeGroups = attributeGroups;
  }

  /**
   * Prepares derived data for a given attribute. 
   * @param oAtt {Object} The attribute object. 
   * @param attName {String} Internal name of the attribute, e.g. 'magicSense'. 
   * @private
   */
  _prepareDerivedAttributeData(context, oAtt, attName) {
    const attValue = parseInt(oAtt.value);
    const req = new Ruleset().getAttributeAdvancementRequirements(attValue);

    // Calculate advancement requirements. 
    oAtt.requiredSuccessses = req.requiredSuccessses;
    oAtt.requiredFailures = req.requiredFailures;

    // Add internal name. 
    oAtt.name = attName;

    // Add localization keys. 
    oAtt.localizableName = `ambersteel.character.attribute.${attName}.label`;
    oAtt.localizableAbbreviation = `ambersteel.character.attribute.${attName}.abbreviation`;

    // Add functions.
    const thiz = this;
    oAtt.getRollData = () => {
      return new SummedData(attValue, [
        new SummedDataComponent(attName, oAtt.localizableName, attValue)
      ]);
    };
    oAtt.advanceAttributeBasedOnRollResult = this.advanceAttributeBasedOnRollResult.bind(context);
  }
  
  /**
   * @param {Document} context 
   * @returns {Array<Object>} { name: {String}, attributeNames: {Array<String>} }
   * @private
   */
  _getAttributeGroupNames(context) {
    const result = [];

    for (const attributeGroupName in context.data.data.attributes) {
      const attributeNames = [];
      for (const attributeName in context.data.data.attributes[attributeGroupName]) {
        attributeNames.push(attributeName);
      }

      const obj = { name: attributeGroupName, attributeNames: attributeNames };
      result.push(obj);
    }

    return result;
  }

  /**
   * Updates the given actorData with derived skill data. 
   * Assigns items of type skill to the derived lists 'actorData.skills' and 'actorData.learningSkills'. 
   * @param {Actor} context 
   * @private
   */
  _prepareDerivedSkillsData(context) {
    const actorData = context.data.data;
    
    actorData.skills = (context.items.filter(item => {
      return item.data.type == "skill" && parseInt(item.data.data.value) > 0
    }));
    for (const oSkill of actorData.skills) {
      this._prepareDerivedSkillData(context, oSkill.id);
    };
    
    actorData.learningSkills = (context.items.filter(item => {
      return item.data.type == "skill" && parseInt(item.data.data.value) == 0
    }));
    for (const oSkill of actorData.learningSkills) {
      this._prepareDerivedSkillData(context, oSkill.id);
    };
  }
  
  /**
   * Pepares derived skill data. 
   * @param {Actor} context 
   * @param {String} skillId Id of a skill. 
   * @private
   */
  _prepareDerivedSkillData(context, skillId) {
    const oSkill = context.items.get(skillId);
    const skillData = oSkill.data.data;

    skillData.id = oSkill.id;
    skillData.entityName = skillData.entityName ? skillData.entityName : oSkill.name;
    skillData.value = parseInt(skillData.value ? skillData.value : 0);
    skillData.successes = parseInt(skillData.successes ? skillData.successes : 0);
    skillData.failures = parseInt(skillData.failures ? skillData.failures : 0);
    skillData.relatedAttribute = skillData.relatedAttribute ? skillData.relatedAttribute : "agility";

    const req = new Ruleset().getSkillAdvancementRequirements(skillData.value);
    skillData.requiredSuccessses = req.requiredSuccessses;
    skillData.requiredFailures = req.requiredFailures;
  }

  /**
   * Prepares derived health data. 
   * @param {AmbersteelActor} context 
   * @private
   * @async
   */
  _prepareDerivedHealthData(context) {
    const businessData = context.data.data;

    const ruleset = new Ruleset();
    businessData.health.maxHP = ruleset.getCharacterMaximumHp(context);
    businessData.health.maxInjuries = ruleset.getCharacterMaximumInjuries(context);
    businessData.health.maxExhaustion = ruleset.getCharacterMaximumExhaustion(context);
    businessData.health.maxMagicStamina = ruleset.getCharacterMaximumMagicStamina(context).total;
  }

  /**
   * Advances the skill, based on the given {DicePoolResult}. 
   * @param {DicePoolResult} rollResult 
   * @param {String} itemId The id of the skill item to advance. 
   * @async
   */
  async advanceSkillBasedOnRollResult(rollResult, itemId) {
    const oSkill = this.items.get(itemId);
    oSkill.addProgress(rollResult.outcomeType, false);
  }

  /**
   * Attribute roll handler. 
   * @param {DicePoolResult} rollResult 
   * @param {String} attributeName The name of the attribute. 
   * @async
   */
  async advanceAttributeBasedOnRollResult(rollResult, attributeName) {
    if (rollResult === undefined) {
      game.ambersteel.logger.logWarn("rollResult is undefined");
      return;
    }
    await this.addAttributeProgress(rollResult.outcomeType, attributeName);
  }

  /**
   * 
   * @param attName {String} Internal name of an attribute, e.g. 'magicSense'. 
   * @returns {Object} With properties 'object', 'name', 'groupName'
   * @private
   */
  getAttributeForName(attName) {
    const data = this.data.data;

    for (let attGroupName in data.attributes) {
      let oAtt = data.attributes[attGroupName][attName];
      if (oAtt) {
        return {
          object: oAtt,
          name: attName,
          groupName: attGroupName
        };
      }
    }
  }

  /**
   * Sets the level of the attribute with the given name. 
   * @param attName {String} Internal name of an attribute, e.g. 'magicSense'. 
   * @param newValue {Number} Value to set the attribute to, e.g. 0. Default 0
   * @async
   */
  async setAttributeLevel(attName = undefined, newValue = 0) {
    const oAttName = this.getAttributeForName(attName);
    const req = new Ruleset().getAttributeAdvancementRequirements(newValue);
    const propertyPath = `data.attributes.${oAttName.groupName}.${attName}`

    await this.update({
      [`${propertyPath}.value`]: newValue,
      [`${propertyPath}.requiredSuccessses`]: req.requiredSuccessses,
      [`${propertyPath}.requiredFailures`]: req.requiredFailures,
      [`${propertyPath}.successes`]: 0,
      [`${propertyPath}.failures`]: 0
    });
  }

  /**
   * Adds success/failure progress to an attribute. 
   * 
   * Also auto-levels up the attribute, if 'autoLevel' is set to true. 
   * @param {DiceOutcomeTypes} outcomeType The test outcome to work with. 
   * @param {String | undefined} attName Optional. Internal name of an attribute, e.g. 'magicSense'. 
   * @param {Boolean | undefined} autoLevel Optional. If true, will auto-level up. Default false
   * @async
   */
  async addAttributeProgress(outcomeType, attName = undefined, autoLevel = false) {
    if (outcomeType === undefined) {
      game.ambersteel.logger.logWarn("outcomeType is undefined");
      return;
    }

    const oAttName = this.getAttributeForName(attName);
    const oAtt = oAttName.object;

    let successes = parseInt(oAtt.successes);
    let failures = parseInt(oAtt.failures);
    const requiredSuccessses = parseInt(oAtt.requiredSuccessses);
    const requiredFailures = parseInt(oAtt.requiredFailures);
    const propertyPath = `data.attributes.${oAttName.groupName}.${attName}`

    if (outcomeType === DiceOutcomeTypes.SUCCESS) {
      successes++;
      await this.update({ [`${propertyPath}.successes`]: successes });
    } else if (outcomeType === DiceOutcomeTypes.FAILURE || outcomeType === DiceOutcomeTypes.PARTIAL) {
      failures++;
      await this.update({ [`${propertyPath}.failures`]: failures });
    }

    if (autoLevel) {
      if (successes >= requiredSuccessses
      && failures >= requiredFailures) {
        const newLevel = parseInt(oAtt.value) + 1;
        await this.setAttributeLevel(attName, newLevel);
      }
    }
  }
}
