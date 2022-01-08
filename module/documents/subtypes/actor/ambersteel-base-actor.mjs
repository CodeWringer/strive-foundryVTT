import PreparedChatData from '../../../dto/prepared-chat-data.mjs';
import * as UpdateUtil from "../../../utils/document-update-utility.mjs";
import * as ChatUtil from "../../../utils/chat-utility.mjs";
import { ItemGrid } from "../../../components/item-grid/item-grid.mjs";

export default class AmbersteelBaseActor {
  /**
   * The owning Actor object. 
   * @type {Actor}
   */
  parent = undefined;

  /**
   * @type {ItemGrid}
   * @private
   */
  _itemGrid = undefined;
  /**
   * @type {ItemGrid}
   */
  get itemGrid() { return this._itemGrid; }

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

    this.parent.itemGrid = this.itemGrid;
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
  prepareData(context) {}

  /**
   * Prepare derived data for the Actor. 
   * 
   * This is where extensive calculations can occur, to ensure properties aren't 
   * undefined and have meaningful values. 
   * 
   * Derived data is *not* persisted!
   * @param {AmbersteelActor} context
   * @virtual
   */
  prepareDerivedData(context) {
    context.data.data.assets.maxBulk = game.ambersteel.getCharacterMaximumInventory(this.parent);

    let usedBulk = 0;
    for (const possession of context.possessions) {
      usedBulk += possession.data.data.bulk;
    }
    context.data.data.assets.totalBulk = usedBulk;

    // Initialize item grid. 
    this._itemGrid = ItemGrid.from(context);
    context.itemGrid = this.itemGrid;
    this._itemGrid.synchronizeTo(context, false);
    
    this._prepareDerivedAttributesData(context);
    this._prepareDerivedSkillsData(context);
    this._prepareDerivedHealthData(context);
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
    const req = game.ambersteel.getAttributeAdvancementRequirements(attValue);

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

    const req = game.ambersteel.getSkillAdvancementRequirements(skillData.value);
    skillData.requiredSuccessses = req.requiredSuccessses;
    skillData.requiredFailures = req.requiredFailures;
  }

  _prepareDerivedHealthData(context) {
    const businessData = context.data.data;
    businessData.health.maxHP = game.ambersteel.getCharacterMaximumHp(context);
    businessData.health.maxInjuries = game.ambersteel.getCharacterMaximumInjuries(context);
    businessData.health.maxExhaustion = game.ambersteel.getCharacterMaximumExhaustion(context);
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
   * Advances the skill, based on the given {DicePoolResult}. 
   * @param {DicePoolResult} rollResult 
   * @param {String} itemId The id of the skill item to advance. 
   * @async
   */
  async advanceSkillBasedOnRollResult(rollResult, itemId) {
    const oSkill = this.parent.items.get(itemId);
    oSkill.addProgress(rollResult.isSuccess, false);
  }

  /**
   * Attribute roll handler. 
   * @param {DicePoolResult} rollResult 
   * @param {String} attributeName The name of the attribute. 
   * @async
   */
  async advanceAttributeBasedOnRollResult(rollResult, attributeName) {
    await this.parent.addAttributeProgress(attributeName, rollResult.isSuccess);
  }
}
