import { SummedData, SummedDataComponent } from '../../../dto/summed-data.mjs';
import AmbersteelBaseActor from './ambersteel-base-actor.mjs';

export default class AmbersteelBaseCharacterActor extends AmbersteelBaseActor {
  /**
   * @param parent {Actor} The owning Actor. 
   */
  constructor(parent) {
    super(parent);

    this.parent.advanceSkillBasedOnRollResult = this.advanceSkillBasedOnRollResult.bind(this);
    this.parent.advanceAttributeBasedOnRollResult = this.advanceAttributeBasedOnRollResult.bind(this);
  }

  /** @override */
  prepareDerivedData(context) {
    context.data.data.assets.maxBulk = game.ambersteel.getCharacterMaximumInventory(this.parent);
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
    for (const possession of context.possessions) {
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
        this._prepareDerivedAttributeData(oAtt, attName);
        attributes.push(oAtt);
      }

      // Add internal name. 
      oAttGroup.name = attGroupName;
      // Add localization keys. 
      oAttGroup.localizableName = `ambersteel.attributeGroups.${attGroupName}`;
      oAttGroup.localizableAbbreviation = `ambersteel.attributeGroupAbbreviations.${attGroupName}`;
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
  _prepareDerivedAttributeData(oAtt, attName) {
    const attValue = parseInt(oAtt.value);
    const req = game.ambersteel.getAttributeAdvancementRequirements(attValue);

    // Calculate advancement requirements. 
    oAtt.requiredSuccessses = req.requiredSuccessses;
    oAtt.requiredFailures = req.requiredFailures;

    // Add internal name. 
    oAtt.name = attName;

    // Add localization keys. 
    oAtt.localizableName = `ambersteel.attributes.${attName}`;
    oAtt.localizableAbbreviation = `ambersteel.attributeAbbreviations.${attName}`;

    // Add functions.
    const thiz = this;
    oAtt.getRollData = () => {
      return new SummedData(attValue, [
        new SummedDataComponent(attName, oAtt.localizableName, attValue)
      ]);
    };
    oAtt.advanceAttributeBasedOnRollResult = this.advanceAttributeBasedOnRollResult.bind(this);
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
   * @param {AmbersteelActor} context 
   * @private
   */
  _prepareDerivedSkillsData(context) {
    const actorData = context.data.data;

    actorData.skills = (this.parent.items.filter(item => {
      return item.data.type == "skill" && parseInt(item.data.data.value) > 0
    }));
    for (const oSkill of actorData.skills) {
      this._prepareDerivedSkillData(oSkill.id);
    };

    actorData.learningSkills = (this.parent.items.filter(item => {
      return item.data.type == "skill" && parseInt(item.data.data.value) == 0
    }));
    for (const oSkill of actorData.learningSkills) {
      this._prepareDerivedSkillData(oSkill.id);
    };
  }

  /**
   * Pepares derived skill data. 
   * @param skillId {String} Id of a skill. 
   * @private
   */
  _prepareDerivedSkillData(skillId) {
    const oSkill = this.parent.items.get(skillId);
    const skillData = oSkill.data.data;

    skillData.id = oSkill.id;
    skillData.entityName = skillData.entityName ? skillData.entityName : oSkill.name;
    skillData.value = parseInt(skillData.value ? skillData.value : 0);
    skillData.successes = parseInt(skillData.successes ? skillData.successes : 0);
    skillData.failures = parseInt(skillData.failures ? skillData.failures : 0);
    skillData.relatedAttribute = skillData.relatedAttribute ? skillData.relatedAttribute : "agility";

    const req = game.ambersteel.getSkillAdvancementRequirements(skillData.value);
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
    businessData.health.maxHP = game.ambersteel.getCharacterMaximumHp(context);
    businessData.health.maxInjuries = game.ambersteel.getCharacterMaximumInjuries(context);
    businessData.health.maxExhaustion = game.ambersteel.getCharacterMaximumExhaustion(context);
    businessData.health.maxMagicStamina = game.ambersteel.getCharacterMaximumMagicStamina(context).total;
  }

  /**
   * Advances the skill, based on the given {DicePoolResult}. 
   * @param {DicePoolResult} rollResult 
   * @param {String} itemId The id of the skill item to advance. 
   * @async
   */
  async advanceSkillBasedOnRollResult(rollResult, itemId) {
    const oSkill = this.parent.items.get(itemId);
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
    await this.parent.addAttributeProgress(rollResult.outcomeType, attributeName);
  }
}