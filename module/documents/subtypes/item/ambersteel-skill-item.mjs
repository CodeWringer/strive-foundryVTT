import AmbersteelBaseItem from "./ambersteel-base-item.mjs";

export default class AmbersteelSkillItem extends AmbersteelBaseItem {
  /** @override */
  get img() { return "icons/svg/book.svg"; }

  /**
   * Chat message template path. 
   * @type {String}
   */
  get chatMessageTemplate() { return "systems/ambersteel/templates/item/parts/skill.hbs"; }

  /** @override */
  prepareData() {
    this.parent.data.img = this.img;
  }

  /** @override */
  async getChatData() {
    const messageBase = super.getChatData();
    const renderedContent = await renderTemplate(this.chatMessageTemplate, {
      data: {
        _id: this.parent.id,
        name: this.parent.name,
        data: {
          description: this.parent.data.data.description,
        }
      },
      img: this.parent.img,
      isEditable: false,
      isSendable: false
    });

    return {
      ...messageBase,
      flavor: game.i18n.localize("ambersteel.labels.skill"),
      renderedContent: renderedContent
    }
  }

/**
 * Sets the given level of the skill. 
 * 
 * @param newLevel {Number} Value to set the skill to, e.g. 0. Default 0
 * @param resetProgress {Boolean} If true, will also reset successes and failures. Default true
 * @async
 */
async setLevel(newLevel = 0, resetProgress = true) {
  const req = getAdvancementRequirements(newLevel);

  await this.parent.update({
    ["data.value"]: newLevel,
    ["data.requiredSuccessses"]: req.requiredSuccessses,
    ["data.requiredFailures"]: req.requiredFailures,
    ["data.successes"]: resetProgress ? 0 : skillItem.data.data.successes,
    ["data.failures"]: resetProgress ? 0 : skillItem.data.data.failures
  });
};

/**
 * Adds success/failure progress to the skill. 
 * 
 * Also auto-levels up the skill, if 'autoLevel' is set to true. 
 * @param success {Boolean} If true, will add 1 success, else will add 1 failure. Default false
 * @param autoLevel {Boolean} If true, will auto-level up. Default false
 * @param resetProgress {Boolean} If true, will also reset successes and failures,
 * if 'autoLevel' is also true and a level automatically incremented. Default true
 * @async
 */
async addProgress(success = false, autoLevel = false, resetProgress = true) {
  const skillData = this.parent.data.data;

  const successes = parseInt(skillData.successes);
  const failures = parseInt(skillData.failures);
  const requiredSuccessses = parseInt(skillData.requiredSuccessses);
  const requiredFailures = parseInt(skillData.requiredFailures);

  if (success) {
    await this.updateProperty("data.successes", successes + 1);
  } else {
    await this.updateProperty("data.failures", failures + 1);
  }

  if (autoLevel) {
    if (successes >= requiredSuccessses
      && failures >= requiredFailures) {
      const nextSkillValue = parseInt(skillData.value) + 1;
      await this.setLevel(nextSkillValue, resetProgress);
    }
  }
}
}
