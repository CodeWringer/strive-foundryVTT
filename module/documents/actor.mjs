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

    this._prepareAttributesData(actorData);
    this._prepareSkillsData(actorData);
    this._preparePCData(actorData);
  }

  /**
   * Updates the given actorData.attributes with derived data. 
   * @param actorData 
   */
  _prepareAttributesData(actorData) {
    for (let attGroupName in actorData.data.attributes) {
      let oAttGroup = actorData.data.attributes[attGroupName];

      for (let attName in oAttGroup) {
        let oAtt = oAttGroup[attName];
        this._prepareAttributeData(oAtt, attName);
      }
    }
  }

  /**
   * 
   * @param oAtt {Object} The attribute object. 
   * @param attName {String} Internal name of the attribute, e.g. 'magicSense'. 
   */
  _prepareAttributeData(oAtt, attName) {
    let attValue = parseInt(oAtt.value);

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
   * Updates the given actorData.skills with derived data. 
   * @param actorData 
   */
  _prepareSkillsData(actorData) {
    actorData.data.skills = (actorData.items.filter(function(item) { return item.data.type == "skill" && parseInt(item.data.data.value) > 0 }))
    .map((item) => { return item.data });

    actorData.data.learningSkills = (actorData.items.filter(function(item) { return item.data.type == "skill" && parseInt(item.data.data.value) == 0 }))
    .map((item) => { return item.data });

    for (let skill of actorData.data.skills) {
      this._prepareDerivedSkillData(skill);
    }
    for (let skill of actorData.data.learningSkills) {
      this._prepareDerivedSkillData(skill);
    }
  }

  // TODO: Move to item.mjs?
  /**
   * 
   * @param oSkill {Object}
   */
  _prepareDerivedSkillData(oSkill) {
    let skillValue = parseInt(oSkill.data.value)
    
    // Calculate advancement requirements. 
    if (skillValue == 0) {
      oSkill.requiredSuccessses = 10
      oSkill.requiredFailures = 14
    } else {
      oSkill.requiredSuccessses = (skillValue + 1) * skillValue * 2
      oSkill.requiredFailures = (skillValue + 1) * skillValue * 3
    }
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

    this._prepareAttributesData(this.data);
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
    let oAtt = opts.attObject ?? this._getAttributeForName(opts.attName);

    if (opts.success) {
      oAtt.successes = parseInt(oAtt.successes) + 1;
    } else {
      oAtt.failures = parseInt(oAtt.failures) + 1;
    }

    if (opts.autoLevel) {
      if (parseInt(oAtt.successes) >= parseInt(oAtt.requiredSuccessses)
      && parseInt(oAtt.failures) >= parseInt(oAtt.requiredFailures)) {
        oAtt.value = parseInt(oAtt.value) + 1;
      }
    }
  }

  /**
   * Returns a skill item of this actor with the given id. 
   * @param id Id of a skill item. 
   * @returns {Object} the skill item. 
   */
  _getSkillForId(id) {
    return this.items.get(id);
  }

  /**
   * Sets the level of a skill with the given id. 
   * @param opts {Object} Options object. 
   * @param opts.skillId {String} Id of the skill. 
   * @param opts.attObject {Object} Skill item object. Takes precedence over 'skillId'. 
   * @param opts.newValue {Number} Value to set the skill to, e.g. 0. Default 0
   */
  setSkillLevel(opts = {skillId: undefined, skillObject: undefined, newValue: undefined}) {
    opts = {
      skillId: undefined,
      skillObject: undefined,
      newValue: 0,
      ...opts
    };

    let oSkill = opts.skillObject ?? this._getSkillForId(opts.skillId);
    oSkill.value = newValue;

    this._prepareSkillsData(this.data);
  }

  /**
   * Adds success/failure progress to a skill. 
   * 
   * Also auto-levels up the skill, if opts.allowLevel is set to true. 
   * @param opts {Object} Options object. 
   * @param opts.skillId {String} Id of a skill item. 
   * @param opts.skillObject {Object} Skill object. Takes precedence over 'skillId'. 
   * @param opts.success {Boolean} If true, will add 1 success, else will add 1 failure. Default false
   * @param opts.success {Boolean} If true, will auto-level up. Default true
   */
  progressSkill(opts = {skillId: undefined, skillObject: undefined, success: undefined, autoLevel: undefined}) {
    opts = {
      skillId: undefined,
      skillObject: undefined,
      success: false,
      autoLevel: true,
      ...opts
    }
    let oSkill = opts.skillObject ?? this._getSkillForId(opts.skillId);
    let skillData = oSkill.data.data;

    if (opts.success) {
      skillData.successes = parseInt(skillData.successes) + 1;
    } else {
      skillData.failures = parseInt(skillData.failures) + 1;
    }

    if (opts.autoLevel) {
      if (parseInt(skillData.successes) >= parseInt(skillData.requiredSuccessses)
      && parseInt(skillData.failures) >= parseInt(skillData.requiredFailures)) {
        skillData.value = parseInt(skillData.value) + 1;
      }
    }
  }
}