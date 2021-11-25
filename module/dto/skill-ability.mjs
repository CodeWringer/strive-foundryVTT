import * as ChatUtil from '../utils/chat-utility.mjs';
import { validateOrThrow } from '../utils/validation-utility.mjs';
import PreparedChatData from './prepared-chat-data.mjs';

/**
 * Represents a skill ability. 
 * 
 * Is a child object of a skill item. 
 * @property {String} args.name
 * @property {String} args.description
 * @property {Number} args.requiredLevel
 * @property {String} args.condition
 * @property {String} args.img
 * @property {Number|undefined} args.apCost
 * @property {Number|undefined} args.distance
 * @property {String} args.damageFormula
 * @property {CONFIG.ambersteel.damageTypes|undefined} args.damageType
 * @property {CONFIG.ambersteel.attackTypes|undefined} args.attackType
 */
export default class SkillAbility {
  constructor(args = {}) {
    args = {
      name: "New Skill Ability",
      description: "",
      requiredLevel: 0,
      condition: "",
      img: "icons/svg/item-book.svg",
      apCost: 0,
      distance: 0,
      damageFormula: "",
      damageType: CONFIG.ambersteel.damageTypes.none,
      attackType: CONFIG.ambersteel.attackTypes.none,
      ...args
    };

    this.type = "SkillAbility";

    this.name = args.name;
    this.description = args.description;
    this.requiredLevel = args.requiredLevel;
    this.apCost = args.apCost;
    this.condition = args.condition;
    this.img = args.img;
    this.distance = args.distance;
    this.damageFormula = args.damageFormula;
    this.damageType = args.damageType;
    this.attackType = args.attackType;
  }

  /**
   * Chat message template path. 
   * @type {String}
   */
  static get chatMessageTemplate() { return "systems/ambersteel/templates/chat/chat-skill-ability.hbs"; }

  /**
   * Returns prepared chat data for the given skill ability. 
   * @param {Object} args Argument-holder object. 
   * @param {Object} args.skillAbility The skill ability object. 
   * @param {Object} args.parentItem The item that owns the skill ability. 
   * @param {Object} args.actor Optional. The actor that owns the parent item. 
   * @returns {PreparedChatData}
   * @virtual
   */
  static async getChatData(args = {}) {
    args = { 
      skillAbility: undefined,
      parentItem: undefined,
      actor: undefined,
      ...args
    };
    validateOrThrow(args, ["skillAbility", "parentItem"]);

    const key = args.parentItem.data.data.abilities.indexOf(args.skillAbility);
    const localizedName = game.i18n.localize(args.skillAbility.name);
    const localizedDesc = game.i18n.localize(args.skillAbility.description);
    const localizedCondition = game.i18n.localize(args.skillAbility.condition);
    const renderedContent = await renderTemplate(SkillAbility.chatMessageTemplate, {
      skillAbility: {
        name: localizedName,
        description: localizedDesc,
        requiredLevel: args.skillAbility.requiredLevel,
        apCost: args.skillAbility.apCost,
        condition: localizedCondition,
        distance: args.skillAbility.distance,
        damageFormula: args.skillAbility.damageFormula,
        damageType: args.skillAbility.damageType,
        attackType: args.skillAbility.attackType,
      },
      skillItemId: args.parentItem.id,
      key: key,
      isEditable: false,
      isSendable: false
    });
    return new PreparedChatData({
      renderedContent: renderedContent,
      actor: args.actor,
      flavor: localizedName,
      sound: "../sounds/notify.wav"
    });
  }

  /**
   * Sends the given skill ability to chat. 
   * @param {CONFIG.ambersteel.visibilityModes} visibilityMode Determines the visibility of the chat message. 
   * @param {Object} args Argument-holder object. 
   * @param {Object} args.skillAbility The skill ability object. 
   * @param {Object} args.parentItem The item that owns the skill ability. 
   * @param {Object} args.actor Optional. The actor that owns the parent item. 
   * @param {Object} args.visibilityMode Optional. Sets the visibility of the chat message. 
   * @async
   * @virtual
   */
  static async sendToChat(args = {}) {
    args = {
      skillAbility: undefined,
      parentItem: undefined,
      actor: undefined,
      visibilityMode: CONFIG.ambersteel.visibilityModes.public,
      ...args
    };
    validateOrThrow(args, ["skillAbility", "parentItem"]);

    const chatData = await SkillAbility.getChatData(args);
    await ChatUtil.sendToChat({
      visibilityMode: args.visibilityMode,
      ...chatData
    });
  }
}