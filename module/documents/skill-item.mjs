/**
 * A skill item. 
 * @extends {Item}
 * @property groupName: {String}
 * @property skillName: {String}
 * @property value: {Number}
 * @property successes: {Number}
 * @property failures: {Number}
 * @property requiredSuccessses: {Number}
 * @property requiredFailures: {Number}
 * @property abilities: {[Object]}
 */
export class AmbersteelSkillItem extends Item {
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    super.prepareData();
  }

  /**
   * @override
   */
  prepareDerivedData() {
    super.prepareDerivedData();

    const data = this.data;
    
    const req = this._getAdvancementRequirements(data.value);
    data.requiredSuccessses = req.requiredSuccessses;
    data.requiredFailures = req.requiredFailures;
  }

  /**
   * Returns the requirements to the next level of the given level. 
   * @param level The level for which to return the requirements to the next level. 
   * @private
   */
  _getAdvancementRequirements(level = 0) {
    return {
      requiredSuccessses: (level == 0) ? 10 : (level + 1) * level * 2,
      requiredFailures: (level == 0) ? 14 : (level + 1) * level * 3
    }
  }

  /**
   * Sets the level of the skill. 
   * @param newLevel {Number} Value to set the skill to, e.g. 0. Default 0
   * @async
   */
  async setLevel(newLevel = 0) {
    const req = this._getAdvancementRequirements(newLevel);

    await this.update({ 
      ["data.value"]: newLevel,
      ["data.requiredSuccessses"]: req.requiredSuccessses,
      ["data.requiredFailures"]: req.requiredFailures,
      ["data.successes"]: 0,
      ["data.failures"]: 0
    });
  }

  /**
   * Adds success/failure progress to a skill. 
   * 
   * Also auto-levels up the skill, if 'autoLevel' is set to true. 
   * @param skillId {String} Id of a skill item. 
   * @param success {Boolean} If true, will add 1 success, else will add 1 failure. Default false
   * @param autoLevel {Boolean} If true, will auto-level up. Default false
   * @async
   */
  async addProgress(skillId = undefined, success = false, autoLevel = false) {
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
