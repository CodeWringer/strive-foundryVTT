import AmbersteelBaseItem from "./ambersteel-base-item.mjs";
import SkillAbility from "../../../dto/skill-ability.mjs";

export default class AmbersteelSkillItem extends AmbersteelBaseItem {
  /**
   * @param parent {Item} The owning Item. 
   */
  constructor(parent) {
    super(parent);
    
    this.parent.chatMessageTemplate = this.chatMessageTemplate;
    this.parent.getChatData = this.getChatData.bind(this);
    this.parent.setLevel = this.setLevel.bind(this);
    this.parent.addProgress = this.addProgress.bind(this);
    this.parent.setSkillAbilityListVisible = this.setSkillAbilityListVisible.bind(this);
    this.parent.toggleSkillAbilityListVisible = this.toggleSkillAbilityListVisible.bind(this);
    this.parent.createSkillAbility = this.createSkillAbility.bind(this);
    this.parent.deleteSkillAbilityAt = this.deleteSkillAbilityAt.bind(this);
    this.parent.getTotalValue = this.getTotalValue.bind(this);
    this.parent.advanceSkillBasedOnRollResult = this.advanceSkillBasedOnRollResult.bind(this);
  }

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
    const req = game.ambersteel.getSkillAdvancementRequirements(newLevel);

    await this.parent.update({
      data: {
        value: newLevel,
        requiredSuccessses: req.requiredSuccessses,
        requiredFailures: req.requiredFailures,
        successes: resetProgress ? 0 : this.parent.data.data.successes,
        failures: resetProgress ? 0 : this.parent.data.data.failures
      }
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

  /**
   * Toggles the visibility of the skill ability list. 
   * @param {Boolean} visible If true, will set the skill ability list to visible. 
   */
  async setSkillAbilityListVisible(visible) {
    await this.updateProperty("data.isExpanded", visible);
  }

  /**
   * Toggles the visibility of the skill ability list. 
   */
  async toggleSkillAbilityListVisible() {
    await this.setSkillAbilityListVisible(!this.parent.data.data.isExpanded);
  }

  /**
   * Adds a new skill ability. 
   */
  async createSkillAbility() {
    const abilities = this.parent.data.data.abilities.concat(
      [new SkillAbility()]
    );
    await this.updateProperty("data.abilities", abilities);
  }

  /**
   * Deletes the skill ability at the given index. 
   * @param index Index of the skill ability to delete. 
   */
  async deleteSkillAbilityAt(index) {
    const dataAbilities = this.parent.data.data.abilities;
    const abilities = dataAbilities.slice(0, index).concat(dataAbilities.slice(index + 1));
    await this.updateProperty("data.abilities", abilities);
  }

  /**
   * Returns the number of dice available for a test of this skill. 
   * @returns {Number} The number of dice available for the test. 
   */
  getTotalValue() {
    const relatedAttributeName = this.parent.data.data.relatedAttribute;
    const attGroupName = game.ambersteel.getAttributeGroupName(relatedAttributeName);
    
    const actor = this.parent.parent;
    const relatedAttributeLevel = actor ? actor.data.data.attributes[attGroupName][relatedAttributeName].value : 0;

    const skillLevel = this.parent.data.data.value;

    return game.ambersteel.getSkillTestNumberOfDice(skillLevel, relatedAttributeLevel);
  }

  /**
   * Advances the skill, based on the given {DicePoolResult}. 
   * @param {DicePoolResult} rollResult 
   * @async
   */
  async advanceSkillBasedOnRollResult(rollResult) {
    this.parent.addProgress(rollResult.isSuccess, false);
  }
}
