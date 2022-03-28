import { TEMPLATES } from '../templatePreloader.mjs';
import * as ChatUtil from '../utils/chat-utility.mjs';
import { validateOrThrow } from '../utils/validation-utility.mjs';
import PreparedChatData from './prepared-chat-data.mjs';
import SkillAbilityChatMessageViewModel from '../../templates/item/skill-ability/skill-ability-chat-message-viewmodel.mjs';
import { createUUID } from '../utils/uuid-utility.mjs';
import * as PropUtil from '../utils/property-utility.mjs';
import * as UpdateUtil from "../utils/document-update-utility.mjs";

/**
 * Represents a skill ability. 
 * 
 * Is **always** a child object of a skill item. 
 * @property {AmbersteelItem} parent The owning skill item. 
 * @property {Number} index The index of the skill ability, on the owning skill item. 
 * @property {String} name 
 * @property {String} description 
 * @property {Number} requiredLevel 
 * @property {String} condition 
 * @property {String} img 
 * @property {Number} apCost 
 * @property {Number} distance 
 * @property {String} damageFormula 
 * @property {String} obstacle 
 * @property {Boolean} isCustom 
 * @property {CONFIG.ambersteel.damageTypes} damageType 
 * @property {CONFIG.ambersteel.attackTypes} attackType 
 */
export default class SkillAbility {
  /**
   * @param {AmbersteelItem} args.parent The owning skill item. 
   * @param {Number} index The index of the skill ability, on the owning skill item. 
   * @param {String | undefined} args.name Optional. 
   * @param {String | undefined} args.description Optional. 
   * @param {Number | undefined} args.requiredLevel Optional. 
   * @param {String | undefined} args.condition Optional. 
   * @param {String | undefined} args.img Optional. 
   * @param {Number | undefined} args.apCost Optional. 
   * @param {Number | undefined} args.distance Optional. 
   * @param {String | undefined} args.damageFormula Optional. 
   * @param {String | undefined} args.obstacle Optional. 
   * @param {Boolean | undefined} args.isCustom Optional. 
   * @param {CONFIG.ambersteel.damageTypes | undefined} args.damageType Optional. 
   * @param {CONFIG.ambersteel.attackTypes | undefined} args.attackType Optional. 
   */
  constructor(args = {}) {
    validateOrThrow(args, ["parent", "index"]);
    
    this.parent = args.parent;
    this.index = args.index;
    
    this.type = "skill-ability";

    this.name = args.name ?? game.i18n.localize("ambersteel.labels.nameOfNewSkillAbility");
    this.description = args.description ?? "";
    this.requiredLevel = args.requiredLevel ?? 0;
    this.apCost = args.apCost ?? 0;
    this.condition = args.condition ?? "";
    this.img = args.img ?? "icons/svg/book.svg";
    this.distance = args.distance ?? 0;
    this.damageFormula = args.damageFormula ?? "";
    this.obstacle = args.obstacle ?? "0";
    this.isCustom = args.isCustom ?? false;

    this.damageType = args.damageType ?? CONFIG.ambersteel.damageTypes.none.name;
    this.attackType = args.attackType ?? CONFIG.ambersteel.attackTypes.none.name;
  }

  /**
   * Chat message template path. 
   * @type {String}
   */
  get chatMessageTemplate() { return TEMPLATES.SKILL_ABILITY_CHAT_MESSAGE; }

  /**
   * Base implementation of returning data for a chat message, based on this item. 
   * @returns {PreparedChatData}
   * @virtual
   * @async
   */
  async getChatData() {
    const actor = this.parent.parent;
    const vm = this.getChatViewModel();

    const renderedContent = await renderTemplate(this.chatMessageTemplate, {
      viewModel: vm,
    });

    return new PreparedChatData({
      renderedContent: renderedContent,
      actor: actor, 
      sound: "../sounds/notify.wav",
      viewModel: vm,
    });
  }

  /**
   * Returns an instance of a view model for use in a chat message. 
   * @returns {SheetViewModel}
   * @param {Object | undefined} overrides Optional. An object that allows overriding any of the view model properties. 
   * @param {String | undefined} overrides.id
   * @param {Boolean | undefined} overrides.isEditable
   * @param {Boolean | undefined} overrides.isSendable
   * @param {Boolean | undefined} overrides.isOwner
   * @param {Boolean | undefined} overrides.isGM
   * @virtual
   */
  getChatViewModel(overrides = {}) {
    return new SkillAbilityChatMessageViewModel({
      id: `${this.parent.id}-${createUUID()}`,
      isEditable: false,
      isSendable: false,
      isOwner: this.parent.isOwner ?? this.parent.owner ?? false,
      isGM: game.user.isGM,
      item: this.parent,
      skillAbility: this,
      actor: this.parent.parent,
      index: this.index,
      ...overrides,
    });
  }

  /**
   * Base implementation of sending this item to the chat. 
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

  delete() {
    this.parent.deleteSkillAbilityAt(this.index);
  }

  /**
   * Updates a property of this SkillAbility on the parent item, identified via the given path. 
   * @param {String} propertyPath Path leading to the property to update, on the SkillAbility. 
   *        Array-accessing via brackets is supported. Property-accessing via brackets is *not* supported. 
   *        E.g.: "data.attributes[0].value"
   * @param {any} newValue The value to assign to the property. 
   * @param {Boolean | undefined} render If true, will trigger a re-render of the associated document sheet. Default 'true'. 
   * @async
   * @protected
   */
  async updateProperty(propertyPath, newValue, render = true) {
    PropUtil.setNestedPropertyValue(this, propertyPath, newValue);
    
    const abilitiesArray = [];
    for (const skillAbility of this.parent.data.data.abilities) {
      abilitiesArray.push(skillAbility._toPlainObject());
    }
    
    await UpdateUtil.updateProperty(this.parent, `data.data.abilities`, abilitiesArray, render);
  }

  /**
   * @private
   * @returns {Object}
   */
  _toPlainObject() {
    // IMPORTANT: To avoid problems with recursion, the parent field **must not** be included!
    // The index field is also omitted, because it can be derived. 
    return {
      name: this.name,
      description: this.description,
      requiredLevel: this.requiredLevel,
      condition: this.condition,
      img: this.img,
      apCost: this.apCost,
      distance: this.distance,
      damageFormula: this.damageFormula,
      obstacle: this.obstacle,
      isCustom: this.isCustom,
      damageType: this.damageType, 
      attackType: this.attackType, 
    }
  }
}