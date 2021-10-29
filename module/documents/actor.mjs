/**
 * @extends {Actor}
 */
export class AmbersteelActor extends Actor {

  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded
    // documents or derived data.
  }

  /**
   * @override
   * Augment the basic actor data with additional dynamic data. Typically,
   * you'll want to handle most of your calculated/derived data in this step.
   * Data calculated in this step should generally not exist in template.json
   * (such as ability modifiers rather than ability scores) and should be
   * available both inside and outside of character sheets (such as if an actor
   * is queried and has a roll executed directly from it).
   */
  prepareDerivedData() {
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
   */
  _prepareDerivedAttributeData(oAtt, attName) {
    const attValue = parseInt(oAtt.value);

    // Calculate advancement requirements. 
    oAtt.requiredSuccessses = (attValue + 1) * (attValue + 1) * 3;
    oAtt.requiredFailures = (attValue + 1) * (attValue + 1) * 4;

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
   */
  _prepareDerivedSkillData(skillId) {
    const oSkill = this.items.get(skillId);
    const skillData = oSkill.data.data;

    skillData.id = oSkill.id;
    skillData.skillName = skillData.skillName ? skillData.skillName : "";
    skillData.entityName = skillData.entityName ? skillData.entityName : oSkill.name;
    skillData.value = parseInt(skillData.value ? skillData.value : 0);
    skillData.successes = parseInt(skillData.successes ? skillData.successes : 0);
    skillData.failures = parseInt(skillData.failures ? skillData.failures : 0);
    skillData.relatedAttribute = skillData.relatedAttribute ? skillData.relatedAttribute : "agility";
    
    const req = this._getSkillRequirements(skillData.value);
    skillData.requiredSuccessses = req.requiredSuccessses;
    skillData.requiredFailures = req.requiredFailures;
  }

  /**
   * Prepare PC type specific data
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
   */
  _getAttributeForName(attName) {
    const data = this.data.data;

    for (let attGroupName in data.attributes) {
      let oAtt = data.attributes[attGroupName][attName];
      if (oAtt) {
        return oAtt;
      }
    }
  }

  /**
   * Sets the level of an attribute with the given name. 
   * @param opts {Object} Options object. 
   * @param opts.attName {String} Internal name of an attribute, e.g. 'magicSense'. 
   * @param opts.attObject {Object} Attribute object. Takes precedence over 'attName'. 
   * @param opts.newValue {Number} Value to set the attribute to, e.g. 0. Default 0
   */
  setAttributeLevel(opts = {attName: undefined, attObject: undefined, newValue: undefined}) {
    opts = {
      attName: undefined,
      attObject: undefined,
      newValue: 0,
      ...opts
    };

    let oAtt = opts.attObject ?? this._getAttributeForName(opts.attName);
    oAtt.value = newValue;

    this._prepareDerivedAttributeData(oAtt, oAtt.name);
  }

  /**
   * Adds success/failure progress to an attribute. 
   * 
   * Also auto-levels up the attribute, if opts.allowLevel is set to true. 
   * @param opts {Object} Options object. 
   * @param opts.attName {String} Internal name of an attribute, e.g. 'magicSense'. 
   * @param opts.attObject {Object} Attribute object. Takes precedence over 'attName'. 
   * @param opts.success {Boolean} If true, will add 1 success, else will add 1 failure. Default false
   * @param opts.success {Boolean} If true, will auto-level up. Default true
   */
  progressAttribute(opts = {attName: undefined, attObject: undefined, success: undefined, autoLevel: undefined}) {
    opts = {
      attName: undefined,
      attObject: undefined,
      success: false,
      autoLevel: true,
      ...opts
    }
    const oAtt = opts.attObject ?? this._getAttributeForName(opts.attName);

    if (opts.success) {
      oAtt.successes = parseInt(oAtt.successes) + 1;
    } else {
      oAtt.failures = parseInt(oAtt.failures) + 1;
    }

    if (opts.autoLevel) {
      if (parseInt(oAtt.successes) >= parseInt(oAtt.requiredSuccessses)
      && parseInt(oAtt.failures) >= parseInt(oAtt.requiredFailures)) {
        oAtt.value = parseInt(oAtt.value) + 1;
        this._prepareDerivedAttributeData(oAtt, oAtt.name);
      }
    }
  }

  /**
   * Returns the requirements to the next level of the given level. 
   * @param level The level for which to return the requirements to the next level. 
   */
  _getSkillRequirements(level = 0) {
    return {
      requiredSuccessses: (level == 0) ? 10 : (level + 1) * level * 2,
      requiredFailures: (level == 0) ? 14 : (level + 1) * level * 3
    }
  }

  /**
   * Sets the level of a skill with the given id. 
   * @param skillId {String} Id of the skill. 
   * @param newValue {Number} Value to set the skill to, e.g. 0. Default 0
   */
  async setSkillLevel(skillId = undefined, newValue = 0) {
    const oSkill = this.items.get(skillId);
    const req = this._getSkillRequirements(newValue);

    await oSkill.update({ 
      ["data.value"]: nextSkillValue,
      ["data.requiredSuccessses"]: req.requiredSuccessses,
      ["data.requiredFailures"]: req.requiredFailures,
      ["data.successes"]: 0,
      ["data.failures"]: 0
    });
  }

  /**
   * Adds success/failure progress to a skill. 
   * 
   * Also auto-levels up the skill, if 'allowLevel' is set to true. 
   * @param skillId {String} Id of a skill item. 
   * @param success {Boolean} If true, will add 1 success, else will add 1 failure. Default false
   * @param success {Boolean} If true, will auto-level up. Default true
   */
  async progressSkill(skillId = undefined, success = false, autoLevel = true) {
    const oSkill = this.items.get(skillId);
    const skillData = oSkill.data.data;

    const successes = parseInt(skillData.successes);
    const failures = parseInt(skillData.failures);
    const requiredSuccessses = parseInt(skillData.requiredSuccessses);
    const requiredFailures = parseInt(skillData.requiredFailures);

    if (success) {
      await oSkill.update({ ["data.successes"]: successes + 1 });
    } else {
      await oSkill.update({ ["data.failures"]: failures + 1 });
    }

    if (autoLevel) {
      if (successes >= requiredSuccessses
      && failures >= requiredFailures) {
        const nextSkillValue = parseInt(skillData.value) + 1;
        await this.setSkillLevel(nextSkillValue);
      }
    }
  }
}