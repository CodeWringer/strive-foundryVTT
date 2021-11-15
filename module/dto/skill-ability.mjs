import * as ChatUtil from '../utils/chat-utility.mjs';
import { validateOrThrow } from '../utils/validation-utility.mjs';
import PreparedChatData from './prepared-chat-data.mjs';

/**
 * Represents a skill ability. 
 * 
 * Is a child object of a skill item. 
 * @property {String} name
 * @property {String} description
 * @property {Number} requiredLevel
 * @property {Number} apCost
 * @property {String} condition
 * @property {String} img
 * @property {Number} distance
 * @property {Number} damage
 * @property {CONFIG.ambersteel.damageTypes} damageType
 */
export default class SkillAbility {
  constructor(args = {
    name: "New Skill Ability", 
    description: "", 
    requiredLevel: 0, 
    apCost: 0, 
    condition: "", 
    img: "icons/svg/item-book.svg",
    distance: 0,
    damage: 0,
    damageType: undefined
  }) {
    this.type = "SkillAbility";

    this.name = args.name;
    this.description = args.description;
    this.requiredLevel = args.requiredLevel;
    this.apCost = args.apCost;
    this.condition = args.condition;
    this.img = args.img;
    this.distance = args.distance;
    this.damage = args.damage;
    this.damageType = args.damageType;
  }

  /**
   * Chat message template path. 
   * @type {String}
   */
  static get chatMessageTemplate() { return "systems/ambersteel/templates/components/skill-ability.hbs"; }

  /**
   * Returns prepared chat data for the given skill ability. 
   * @param {Object} args Argument-holder object. 
   * @param {Object} args.skillAbility The skill ability object. 
   * @param {Object} args.parentSkillItem The item that owns the skill ability. 
   * @param {Object} args.actor Optional. The actor that owns the parent item. 
   * @returns {PreparedChatData}
   * @virtual
   */
  static async getChatData(args = {skillAbility, parentSkillItem, actor}) {
    validateOrThrow(args, ["skillAbility", "parentSkillItem"]);

    const key = parentSkillItem.data.data.skillAbilities.indexOf(skillAbility);
    const localizedName = game.i18n.localize(args.skillAbility.name);
    const localizedDesc = game.i18n.localize(args.skillAbility.description);
    const localizedCondition = game.i18n.localize(args.skillAbility.condition);
    const renderedContent = await renderTemplate(SkillAbility.chatMessageTemplate, {
      skillAbility: {
        parentItemId: args.parentSkillItem.id,
        name: localizedName,
        description: localizedDesc,
        requiredLevel: args.skillAbility.requiredLevel,
        apCost: args.skillAbility.apCost,
        condition: localizedCondition
      },
      key: key,
      isEditable: args.parentSkillItem.isOwner,
      isSendable: args.parentSkillItem.isOwner
    });
    return new PreparedChatData(renderedContent, args.actor, localizedName, "../sounds/notify.wav");
  }

  /**
   * Sends the given skill ability to chat. 
   * @param {CONFIG.ambersteel.visibilityModes} visibilityMode Determines the visibility of the chat message. 
   * @param {Object} args Argument-holder object. 
   * @param {Object} args.skillAbility The skill ability object. 
   * @param {Object} args.parentSkillItem The item that owns the skill ability. 
   * @param {Object} args.actor Optional. The actor that owns the parent item. 
   * @param {Object} args.visibilityMode Optional. Sets the visibility of the chat message. 
   * @async
   * @virtual
   */
  static async sendToChat(args = {skillAbility, parentSkillItem, actor, visibilityMode: CONFIG.ambersteel.visibilityModes.public}) {
    validateOrThrow(args, ["skillAbility", "parentSkillItem"]);

    const chatData = await SkillAbility.getChatData(args);
    await ChatUtil.sendToChat({
      visibilityMode: visibilityMode,
      ...chatData
    });
  }
}