import { TEMPLATES } from '../../../presentation/template/templatePreloader.mjs';
import * as ChatUtil from '../../../presentation/chat/chat-utility.mjs';
import { validateOrThrow } from '../../util/validation-utility.mjs';
import PreparedChatData from '../../../presentation/chat/prepared-chat-data.mjs';
import SkillAbilityChatMessageViewModel from '../../../presentation/template/item/skill-ability/skill-ability-chat-message-viewmodel.mjs';
import { createUUID } from '../../util/uuid-utility.mjs';
import * as PropUtil from '../../util/property-utility.mjs';
import DamageAndType from './damage-and-type.mjs';
import { SOUNDS_CONSTANTS } from '../../../presentation/audio/sounds.mjs';
import { VISIBILITY_MODES } from '../../../presentation/chat/visibility-modes.mjs';

/**
 * Represents a skill ability. 
 * 
 * Is **always** a child object of a skill document. 
 * 
 * @property {TransientSkill} owningDocument The owning document. I. e. a `TransientSkill`. 
 * * Read-only. 
 * @property {String} owningDocumentId UUID of the owning document. 
 * * Read-only. 
 * @property {String} type Returns the content type of this "document". 
 * * Read-only. 
 * @property {Number} index The index of the skill ability, on the owning document. 
 * @property {String} id UUID of this instance of a skill ability. 
 * @property {Boolean} isCustom If `true`, this skill ability was added by a user. 
 * @property {String} name Internal name of the skill. 
 * @property {String} img A relative url to an image resource on the server. 
 * @property {String} description 
 * @property {Number} requiredLevel 
 * @property {Number} apCost 
 * @property {Array<DamageAndType>} damage
 * @property {String | undefined} condition 
 * @property {Number | undefined} distance 
 * @property {String | undefined} obstacle 
 * @property {String | undefined} opposedBy 
 * @property {AttackType | undefined} attackType 
 */
export default class SkillAbility {
  /**
   * Returns the content type of this "document". 
   * 
   * @type {String}
   * @readonly
   */
  get type() { return "skill-ability"; }

  /**
   * @param {TransientSkill} owningDocument The owning document.
   * @param {Number} index The index of the skill ability, on the owning document. 
   * @param {String | undefined} id Optional. UUID of this instance of a skill ability. 
   * @param {Boolean | undefined} args.isCustom Optional. 
   * @param {String | undefined} args.name Optional. 
   * @param {String | undefined} args.img Optional. 
   * @param {String | undefined} args.description Optional. 
   * @param {Number | undefined} args.requiredLevel Optional. 
   * @param {Number | undefined} args.apCost Optional. 
   * @param {Array<DamageAndType> | undefined} args.damage Optional. 
   * @param {String | undefined} args.condition Optional. 
   * @param {Number | undefined} args.distance Optional. 
   * @param {String | undefined} args.obstacle Optional. 
   * @param {String | undefined} args.opposedBy Optional. 
   * @param {AttackType | undefined} args.attackType Optional. 
   * 
   * @throws {Error} Thrown, if `owningDocument` or `index` are undefined. 
   */
  constructor(args = {}) {
    validateOrThrow(args, ["owningDocument", "index"]);
    
    this.owningDocument = args.owningDocument;
    this.owningDocumentId = args.owningDocument.id;
    this.index = args.index;
    
    this.id = args.id ?? createUUID();
    this.isCustom = args.isCustom ?? false;

    this.name = args.name ?? game.i18n.localize("ambersteel.character.skill.ability.newDefaultName");
    this.img = args.img ?? "icons/svg/book.svg";
    this.description = args.description ?? "";
    this.requiredLevel = args.requiredLevel ?? 0;
    this.apCost = args.apCost ?? 0;
    this.damage = args.damage ?? [];
    this.condition = args.condition;
    this.distance = args.distance;
    this.obstacle = args.obstacle;
    this.opposedBy = args.opposedBy;
    this.attackType = args.attackType;
  }

  /**
   * Chat message template path. 
   * @type {String}
   * @readonly
   */
  get chatMessageTemplate() { return TEMPLATES.SKILL_ABILITY_CHAT_MESSAGE; }
  
  /**
   * Base implementation of returning data for a chat message, based on this item. 
   * @returns {PreparedChatData}
   * @virtual
   * @async
   */
  async getChatData() {
    const actor = this.owningDocument.owningDocument.document;
    const vm = this.getChatViewModel();

    const renderedContent = await renderTemplate(this.chatMessageTemplate, {
      viewModel: vm,
    });

    return new PreparedChatData({
      renderedContent: renderedContent,
      actor: actor, 
      sound: SOUNDS_CONSTANTS.NOTIFY,
      viewModel: vm,
    });
  }

  /**
   * Returns an instance of a view model for use in a chat message. 
   * 
   * @param {Object | undefined} overrides Optional. An object that allows overriding any of the view model properties. 
   * @param {String | undefined} overrides.id
   * @param {Boolean | undefined} overrides.isEditable
   * @param {Boolean | undefined} overrides.isSendable
   * @param {Boolean | undefined} overrides.isOwner
   * @param {Boolean | undefined} overrides.isGM
   * 
   * @returns {SkillAbilityChatMessageViewModel}
   * 
   * @virtual
   */
  getChatViewModel(overrides = {}) {
    const actor = (this.owningDocument.owningDocument !== undefined) ? 
      this.owningDocument.owningDocument.document : undefined;

    return new SkillAbilityChatMessageViewModel({
      id: this.id,
      isEditable: this.owningDocument.isEditable,
      isSendable: this.owningDocument.isSendable,
      isOwner: this.owningDocument.isOwner,
      isGM: game.user.isGM,
      ...overrides,
      item: this.owningDocument,
      skillAbility: this,
      actor: actor,
      index: this.index,
    });
  }

  /**
   * Base implementation of sending this item to the chat. 
   * @param {VisibilityMode} visibilityMode Determines the visibility of the chat message. 
   * 
   * @async
   * @virtual
   */
  async sendToChat(visibilityMode = VISIBILITY_MODES.public) {
    const chatData = await this.getChatData();
    ChatUtil.sendToChat({
      visibilityMode: visibilityMode,
      ...chatData
    });
  }

  /**
   * Deletes this `SkillAbility`. 
   * 
   * @returns {Boolean} True, if the `SkillAbility` could be removed. 
   */
  delete() {
    if (this.owningDocument === undefined) return false;

    this.owningDocument.deleteSkillAbilityAt(this.index);

    return true;
  }

  /**
   * Updates the properties of this object, based on the given delta object. 
   * 
   * @param {Object} delta An object containing the properties of this object to update. 
   * @param {Boolean | undefined} render If true, will trigger a re-render of the associated document sheet. 
   * * Default 'true'. 
   * 
   * @async
   */
  async update(delta, render = true) {
    for (const propertyName in delta) {
      this[propertyName] = delta[propertyName];
    }

    this._updateToDB(render);
  }

  /**
   * Updates a property of this SkillAbility on the parent item, identified via the given path. 
   * 
   * @param {String} propertyPath Path leading to the property to update, on the SkillAbility. 
   *        Array-accessing via brackets is supported. Property-accessing via brackets is *not* supported. 
   *        E.g.: "data.attributes[0].level"
   * @param {any} newValue The value to assign to the property. 
   * @param {Boolean | undefined} render If true, will trigger a re-render of the associated document sheet. 
   * * Default 'true'. 
   * 
   * @async
   */
  async updateProperty(propertyPath, newValue, render = true) {
    PropUtil.setNestedPropertyValue(this, propertyPath, newValue);
    
    this._updateToDB(render);
  }

  /**
   * Deletes a property on the skill ability, via the given path. 
   * 
   * @param {String} propertyPath Path leading to the property to delete, on the given document entity. 
   *        Array-accessing via brackets is supported. Property-accessing via brackets is *not* supported. 
   *        E.g.: "data.attributes[0].level" 
   *        E.g.: "data.attributes[4]" 
   *        E.g.: "data.attributes" 
   * @param {Boolean | undefined} render If true, will trigger a re-render of the associated document sheet. 
   * * Default 'true'. 
   * 
   * @async
   */
  async deleteByPropertyPath(propertyPath, render = true) {
    PropUtil.deleteNestedProperty(this, propertyPath);

    this._updateToDB(render);
  }

  /**
   * Pushes the skill ability list on the parent to the DB. 
   * 
   * @param {Boolean | undefined} render If true, will trigger a re-render of the associated document sheet. 
   * * Default 'true'. 
   * 
   * @private
   * @async
   */
  async _updateToDB(render = true) {
    this.owningDocument._persistSkillAbilities(render);
  }

  /**
   * Returns a plain object based on the given object instance. 
   * 
   * @returns {Object}
   * 
   * @private
   */
  toDto() {
    // Ensure damage definitions are turned into plain objects. 
    const damage = [];
    for (const o of this.damage) {
      damage.push({ damage: o.damage, damageType: o.damageType.name });
    }

    // IMPORTANT: To avoid problems with recursion, the `owningDocument` field 
    // **must not** be included!
    const obj = Object.create(null);

    obj.id = this.id;
    obj.owningDocumentId = this.owningDocumentId;
    obj.index = this.index;
    obj.isCustom = this.isCustom;
    obj.name = this.name;
    obj.img = this.img;
    obj.description = this.description;
    obj.requiredLevel = this.requiredLevel;
    obj.apCost = this.apCost;
    obj.damage = this.damage;
    obj.condition = this.condition;
    obj.distance = this.distance;
    obj.obstacle = this.obstacle;
    obj.attackType = this.attackType;
    obj.opposedBy = this.opposedBy;
    
    return obj;
  }
}
