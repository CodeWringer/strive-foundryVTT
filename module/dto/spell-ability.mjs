import * as ChatUtil from '../utils/chat-utility.mjs';
import { validateOrThrow } from "../utils/validation-utility.mjs";
import PreparedChatData from './prepared-chat-data.mjs';

/**
 * Represents a spell ability. 
 * 
 * Is a child object of a skill item. 
 */
export default class SpellAbility {
  constructor(name, description, requiredLevel, apCost, condition, img = "icons/svg/item-book.svg") {
    this.type = "SpellAbility";

    this.name = name;
    this.description = description;
    this.requiredLevel = requiredLevel;
    this.apCost = apCost;
    this.condition = condition;
    this.img = img;
  }

  /**
   * Chat message template path. 
   * @type {String}
   */
  static get chatMessageTemplate() { return "systems/ambersteel/templates/components/spell-ability.hbs"; }

  /**
   * Returns prepared chat data for the given spell ability. 
   * @param {Object} args Argument-holder object. 
   * @param {Object} args.spellAbility The spell ability object. 
   * @param {Object} args.parentSkillItem The item that owns the spell ability. 
   * @param {Object} args.actor Optional. The actor that owns the parent item. 
   * @returns {PreparedChatData}
   * @virtual
   */
  static async getChatData(args = {spellAbility, parentSkillItem, actor}) {
    validateOrThrow(args, ["spellAbility", "parentSkillItem"]);

    const key = parentSkillItem.data.data.skillAbilities.indexOf(spellAbility);
    const localizedName = game.i18n.localize(args.spellAbility.name);
    const localizedDesc = game.i18n.localize(args.spellAbility.description);
    const localizedCondition = game.i18n.localize(args.spellAbility.condition);
    const renderedContent = await renderTemplate(spellAbility.chatMessageTemplate, {
      spellAbility: {
        parentItemId: args.parentSkillItem.id,
        name: localizedName,
        description: localizedDesc,
        requiredLevel: args.spellAbility.requiredLevel,
        apCost: args.spellAbility.apCost,
        condition: localizedCondition
      },
      key: key,
      isEditable: args.parentSkillItem.isOwner,
      isSendable: args.parentSkillItem.isOwner
    });
    return new PreparedChatData(renderedContent, args.actor, localizedName, "../sounds/notify.wav");
  }

  /**
   * Sends the given spell ability to chat. 
   * @param {CONFIG.ambersteel.visibilityModes} visibilityMode Determines the visibility of the chat message. 
   * @param {Object} args Argument-holder object. 
   * @param {Object} args.spellAbility The spell ability object. 
   * @param {Object} args.parentSkillItem The item that owns the spell ability. 
   * @param {Object} args.actor Optional. The actor that owns the parent item. 
   * @param {Object} args.visibilityMode Optional. Sets the visibility of the chat message. 
   * @async
   * @virtual
   */
  static async sendToChat(args = {spellAbility, parentSkillItem, actor, visibilityMode: CONFIG.ambersteel.visibilityModes.public}) {
    validateOrThrow(args, ["spellAbility", "parentSkillItem"]);

    const chatData = await spellAbility.getChatData(args);
    await ChatUtil.sendToChat({
      visibilityMode: visibilityMode,
      ...chatData
    });
  }
}