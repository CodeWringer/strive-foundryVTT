import * as Skill from '../utils/skill-utility.mjs';
import * as Attribute from '../utils/attribute-utility.mjs';
import AmbersteelPcActor from './subtypes/actor/ambersteel-pc-actor.mjs';
import AmbersteelNpcActor from './subtypes/actor/ambersteel-npc-actor.mjs';

/**
 * @extends {Actor}
 * @property person {Object}
 * @property attributeGroups: {Object}
 * @property learningSkills: {[Object]}
 * @property skills: {[Object]}
 * @property beliefSystem: {Object}
 * @property fateSystem: {Object}
 * @property biography: {Object}
 */
export class AmbersteelActor extends Actor {
  /**
   * @private
   */
  _subType = undefined;
  /**
   * Type-dependent object which pseudo-extends the logic of this object. 
   */
  get subType() {
    if (!this._subType) {
      const data = super.getData();
      const type = data.actor.type;

      // TODO: Generalize
      if (type === "pc") {
        this._subType = new AmbersteelPcActor(this);
      } else if (type === "npc") {
        this._subType = new AmbersteelNpcActor(this);
      } else {
        throw `Actor subtype ${type} is unrecognized!`
      }
    }
    return this._subType;
  }

  /** @override */
  prepareData() {
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    super.prepareBaseData();
  }

  /** @override */
  prepareDerivedData() {
    super.prepareDerivedData();

    const actorData = this.data;
    const data = actorData.data;
    const flags = actorData.flags.ambersteel || {};

    this._prepareDerivedAttributesData(actorData);
    this._prepareDerivedSkillsData(actorData);
    this._preparePCData(actorData);
  }

  /**
   * Prepares derived data for all attributes. 
   * @param actorData 
   * @private
   */
  _prepareDerivedAttributesData(actorData) {
    for (const attGroupName in actorData.data.attributes) {
      const oAttGroup = actorData.data.attributes[attGroupName];

      for (const attName in oAttGroup) {
        const oAtt = oAttGroup[attName];
        this._prepareDerivedAttributeData(oAtt, attName);
      }
    }
  }

  /**
   * Prepares derived data for a given attribute. 
   * @param oAtt {Object} The attribute object. 
   * @param attName {String} Internal name of the attribute, e.g. 'magicSense'. 
   * @private
   */
  _prepareDerivedAttributeData(oAtt, attName) {
    const attValue = parseInt(oAtt.value);
    const req = Attribute.getAdvancementRequirements(attValue);

    // Calculate advancement requirements. 
    oAtt.requiredSuccessses = req.requiredSuccessses;
    oAtt.requiredFailures = req.requiredFailures;

    // Add internal name. 
    oAtt.name = attName;

    // Add localizable string. 
    oAtt.localizableName = "ambersteel.attributes." + attName;
    oAtt.localizableAbbreviation = "ambersteel.attributeAbbreviations." + attName;
  }

  /**
   * Updates the given actorData with derived skill data. 
   * Assigns items of type skill to the derived lists 'actorData.skills' and 'actorData.learningSkills'. 
   * @param actorData 
   * @private
   */
  _prepareDerivedSkillsData(actorData) {
    const data = actorData.data;

    data.skills = (actorData.items.filter(item => { 
      return item.data.type == "skill" && parseInt(item.data.data.value) > 0 
    })).map(it => it.data);
    for (const oSkill of data.skills) {
      this._prepareDerivedSkillData(oSkill._id);
    };

    data.learningSkills = (actorData.items.filter(item => { 
      return item.data.type == "skill" && parseInt(item.data.data.value) == 0 
    })).map(it => it.data);
    for (const oSkill of data.learningSkills) {
      this._prepareDerivedSkillData(oSkill._id);
    };
  }

  /**
   * 
   * @param skillId {String} Id of a skill. 
   * @private
   */
  _prepareDerivedSkillData(skillId) {
    const oSkill = this.items.get(skillId);
    const skillData = oSkill.data.data;

    skillData.id = oSkill.id;
    skillData.entityName = skillData.entityName ? skillData.entityName : oSkill.name;
    skillData.value = parseInt(skillData.value ? skillData.value : 0);
    skillData.successes = parseInt(skillData.successes ? skillData.successes : 0);
    skillData.failures = parseInt(skillData.failures ? skillData.failures : 0);
    skillData.relatedAttribute = skillData.relatedAttribute ? skillData.relatedAttribute : "agility";
    
    const req = Skill.getAdvancementRequirements(skillData.value);
    skillData.requiredSuccessses = req.requiredSuccessses;
    skillData.requiredFailures = req.requiredFailures;
  }

  /**
   * Prepare PC type specific data. 
   * @param actorData 'this.data'
   * @private
   */
  _preparePCData(actorData) {
    if (actorData.type !== 'pc') return;

    // Ensure beliefs array has 3 items. 
    while (actorData.data.beliefSystem.beliefs.length < 3) {
      actorData.data.beliefSystem.beliefs.push("")
    }

    // Ensure instincts array has 3 items. 
    while (actorData.data.beliefSystem.instincts.length < 3) {
      actorData.data.beliefSystem.instincts.push("")
    }
  }

  /**
   * 
   * @param attName {String} Internal name of an attribute, e.g. 'magicSense'. 
   * @returns {Object} With properties 'object', 'name', 'groupName'
   * @private
   */
  _getAttributeForName(attName) {
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
    const oAttName = this._getAttributeForName(attName);
    const req = Attribute.getAdvancementRequirements(newValue);
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
   * @param attName {String} Internal name of an attribute, e.g. 'magicSense'. 
   * @param success {Boolean} If true, will add 1 success, else will add 1 failure. Default false
   * @param autoLevel {Boolean} If true, will auto-level up. Default false
   * @async
   */
  async addAttributeProgress(attName = undefined, success = false, autoLevel = false) {
    const oAttName = this._getAttributeForName(attName);
    const oAtt = oAttName.object;

    const successes = parseInt(oAtt.successes);
    const failures = parseInt(oAtt.failures);
    const requiredSuccessses = parseInt(oAtt.requiredSuccessses);
    const requiredFailures = parseInt(oAtt.requiredFailures);
    const propertyPath = `data.attributes.${oAttName.groupName}.${attName}`

    if (success) {
      await this.update({ [`${propertyPath}.successes`]: successes + 1 });
    } else {
      await this.update({ [`${propertyPath}.failures`]: failures + 1 });
    }

    if (autoLevel) {
      if (successes >= requiredSuccessses
      && failures >= requiredFailures) {
        const newLevel = parseInt(oAtt.value) + 1;
        await this.setAttributeLevel(attName, newLevel);
      }
    }
  }

  /**
   * Sends this Actor to chat. 
   * @returns {Promise<any>} 
   * @async
   */
  async sendToChat() {
    return this.subType.sendToChat();
  }

  /**
   * Updates a property on this Actor, identified via the given path. 
   * @param propertyPath {String} Path leading to the property to update, on this Actor. 
   *        Array-accessing via brackets is supported. Property-accessing via brackets is *not* supported. 
   *        E.g.: "data.attributes[0].value"
   * @param newValue {any} The value to assign to the property. 
   * @async
   */
  async updateProperty(propertyPath, newValue) {
    await this.subType.updateProperty(propertyPath, newValue);
  }
}