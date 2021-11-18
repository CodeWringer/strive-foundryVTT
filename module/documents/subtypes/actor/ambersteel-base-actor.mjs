import PreparedChatData from '../../../dto/prepared-chat-data.mjs';
import * as AttributeUtil from '../../../utils/attribute-utility.mjs';
import * as SkillUtil from '../../../utils/skill-utility.mjs';
import * as UpdateUtil from "../../../utils/document-update-utility.mjs";
import * as ChatUtil from "../../../utils/chat-utility.mjs";

export default class AmbersteelBaseActor {
  /**
   * The owning Actor object. 
   * @type {Actor}
   */
  parent = undefined;

  /**
   * @param parent {Actor} The owning Actor. 
   */
  constructor(parent) {
    if (!parent || parent === undefined) {
      throw "Argument 'owner' must not be null or undefined!"
    }
    this.parent = parent;

    this.parent.getChatData = this.getChatData.bind(this);
    this.parent.sendToChat = this.sendToChat.bind(this);
    this.parent.sendPropertyToChat = this.sendPropertyToChat.bind(this);
    this.parent.updateProperty = this.updateProperty.bind(this);
    this.parent.advanceSkillBasedOnRollResult = this.advanceSkillBasedOnRollResult.bind(this);
    this.parent.advanceAttributeBasedOnRollResult = this.advanceAttributeBasedOnRollResult.bind(this);
  }

  /**
   * Returns the icon image path for this type of Actor. 
   * @returns {String} The icon image path. 
   * @virtual
   */
  get img() { return "icons/svg/mystery-man.svg"; }

  /**
   * Prepare base data for the Actor. 
   * 
   * This should be non-derivable data, meaning it should only prepare the data object to ensure 
   * certain properties exist and aren't undefined. 
   * This should also set primitive data, even if it is technically derived, shouldn't be any 
   * data set based on extensive calculations. Setting the 'img'-property's path, based on the object 
   * type should be the most complex a 'calculation' as it gets. 
   * 
   * Base data *is* persisted!
   * @param {Actor} context
   * @virtual
   */
  prepareData(context) { }

  /**
   * Prepare derived data for the Actor. 
   * 
   * This is where extensive calculations can occur, to ensure properties aren't 
   * undefined and have meaningful values. 
   * 
   * Derived data is *not* persisted!
   * @virtual
   */
  prepareDerivedData(context) {
    this._prepareDerivedAttributesData(context);
    this._prepareDerivedSkillsData(context);
  }

  /**
   * Prepares derived data for all attributes. 
   * @param context 
   * @private
   */
  _prepareDerivedAttributesData(context) {
    const actorData = context.data;
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
    const req = AttributeUtil.getAdvancementRequirements(attValue);

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
 * @param context 
 * @private
 */
  _prepareDerivedSkillsData(context) {
    const actorData = context.data.data;

    actorData.skills = (this.parent.items.filter(item => {
      return item.data.type == "skill" && parseInt(item.data.data.value) > 0
    })).map(it => it.data);
    for (const oSkill of actorData.skills) {
      this._prepareDerivedSkillData(oSkill._id);
    };

    actorData.learningSkills = (this.parent.items.filter(item => {
      return item.data.type == "skill" && parseInt(item.data.data.value) == 0
    })).map(it => it.data);
    for (const oSkill of actorData.learningSkills) {
      this._prepareDerivedSkillData(oSkill._id);
    };
  }

  /**
   * 
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

    const req = SkillUtil.getAdvancementRequirements(skillData.value);
    skillData.requiredSuccessses = req.requiredSuccessses;
    skillData.requiredFailures = req.requiredFailures;
  }

  /**
   * Base implementation of returning data for a chat message, based on this Actor. 
   * @returns {PreparedChatData}
   * @virtual
   */
  getChatData() {
    const actor = this.parent;
    return new PreparedChatData({
      actor: actor,
      sound: "../sounds/notify.wav"
    });
  }

  /**
   * Base implementation of sending this Actor to the chat. 
   * @param {CONFIG.ambersteel.visibilityModes} visibilityMode Determines the visibility of the chat message. 
   * @async
   * @virtual
   */
  async sendToChat(visibilityMode = CONFIG.ambersteel.visibilityModes.public) {
    const chatData = await this.getChatData();
    ChatUtil.sendToChat({
      visibilityMode: visibilityMode,
      ...chatData
    });
  }

  /**
   * Sends a property of this item to chat, based on the given property path. 
   * @param {String} propertyPath 
   * @param {CONFIG.ambersteel.visibilityModes} visibilityMode 
   * @async
   */
  async sendPropertyToChat(propertyPath, visibilityMode = CONFIG.ambersteel.visibilityModes.public) {
    await ChatUtil.sendPropertyToChat({
      obj: this.parent,
      propertyPath: propertyPath,
      parent: this.parent,
      actor: this.parent.actor,
      visibilityMode: visibilityMode
    });
  }

  /**
   * Updates a property on the parent Actor, identified via the given path. 
   * @param {String} propertyPath Path leading to the property to update, on the parent Actor. 
   *        Array-accessing via brackets is supported. Property-accessing via brackets is *not* supported. 
   *        E.g.: "data.attributes[0].value"
   * @param {any} newValue The value to assign to the property. 
   * @async
   * @protected
   */
  async updateProperty(propertyPath, newValue) {
    await UpdateUtil.updateProperty(this.parent, propertyPath, newValue);
  }

  /**
   * Advances the skill 
   * @param {DicePoolResult} rollResult 
   * @param {String} keyAndIsLearning The index of the skill item in question separated from a boolean indicating 
   * whether this is a learning skill. Format: "key|isLearningSkill"
   * @async
   */
  async advanceSkillBasedOnRollResult(rollResult, keyAndIsLearning) {
    const splits = keyAndIsLearning.split("|");
    const key = parseInt(splits[0]);
    const isLearningSkill = splits[1] === "true";

    // TODO

    // const element = event.currentTarget;
    // const dataset = element.closest(".item").dataset;
    // const itemId = dataset.itemId;
    // const oSkill = this.getItem(itemId);
    // let localizedSkillName = game.i18n.localize(event.currentTarget.dataset.actionName);
    // if (localizedSkillName.length == 0) localizedSkillName = oSkill.name;

    // // Modal dialog to enter obstacle and bonus dice. 
    // const rollInputData = await Dice.queryRollData();

    // if (!rollInputData.confirmed) return;

    // // Determine number of dice to roll. 
    // // If the skill is still being learned, use the related attribute value for the roll, instead. 
    // // Any skill with a level of 0 is one being learned. 
    // let numberOfDice = parseInt(event.currentTarget.dataset.actionValue);
    // if (parseInt(oSkill.data.data.value) == 0) {
    //   const relatedAttName = oSkill.data.data.relatedAttribute;
    //   const oAtt = this.getActor().getAttributeForName(relatedAttName).object;
    //   numberOfDice = oAtt.value;
    // }

    // const localizedActionName = `${game.i18n.localize("ambersteel.labels.skill")}: ${localizedSkillName}`;
    
    // // Do roll. 
    // const result = await Dice.rollDice({
    //   actionName: localizedActionName,
    //   actionValue: numberOfDice, 
    //   obstacle: rollInputData.obstacle,
    //   bonusDice: rollInputData.bonusDice,
    //   actor: this.getActor()  
    // });

    // // Note result towards skill progress. 
    // oSkill.addProgress(result.rollResults.isSuccess, false);

    // // Re-render the sheet to make the progress visible. 
    // this.parent.render();

    // // Display roll result. 
    // Dice.sendDiceResultToChat({ 
    //   renderedContent: result.renderedContent, 
    //   flavor: result.flavor, 
    //   actor: result.actor,
    //   visibilityMode: CONFIG.ambersteel.visibilityModes[rollInputData.visibilityMode]
    // });
  }

  /**
   * Attribute roll handler. 
   * @param {DicePoolResult} rollResult 
   * @param {String} attributeName The name of the attribute. 
   * @async
   */
  async advanceAttributeBasedOnRollResult(rollResult, attributeName) {
    const oAtt = this.parent.getAttributeForName(attributeName).object;
    
    // TODO

    // const localizedAttName = game.i18n.localize(oAtt.localizableName);

    // // Modal dialog to enter obstacle and bonus dice. 
    // const rollInputData = await Dice.queryRollData();

    // if (!rollInputData.confirmed) return;

    // const localizedActionName = `${game.i18n.localize("ambersteel.labels.attribute")}: ${localizedAttName}`;

    // // Do roll. 
    // const result = await Dice.rollDice({
    //   actionName: localizedActionName,
    //   actionValue: event.currentTarget.dataset.actionValue, 
    //   obstacle: rollInputData.obstacle,
    //   bonusDice: rollInputData.bonusDice,
    //   actor: this.getActor()  
    // });

    // // Note result towards attribute progress. 
    // await this.getActor().addAttributeProgress(attName, result.rollResults.isSuccess);

    // // Re-render the sheet to make the progress visible. 
    // this.parent.render();

    // // Display roll result. 
    // Dice.sendDiceResultToChat({
    //   renderedContent: result.renderedContent, 
    //   flavor: result.flavor, 
    //   actor: result.actor,
    //   visibilityMode: CONFIG.ambersteel.visibilityModes[rollInputData.visibilityMode]
    // });
  }
}