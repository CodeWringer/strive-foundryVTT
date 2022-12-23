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
import { isObject } from '../../util/validation-utility.mjs';
import { DAMAGE_TYPES } from '../damage-types.mjs';

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
 * * Read-only. 
 * @property {Boolean} isCustom If `true`, this skill ability was added by a user. 
 * @property {String} name Name of the skill ability. 
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
   * @type {Number}
   */
  get index() { return this._index; }
  set index(value) { this._index = value; this._updateToDB(); }

  /**
   * @type {Boolean}
   */
  get isCustom() { return this._isCustom; }
  set isCustom(value) { this._isCustom = value; this._updateToDB(); }

  /**
   * @type {String}
   */
  get name() { return this._name; }
  set name(value) { this._name = value; this._updateToDB(); }

  /**
   * @type {String}
   */
  get img() { return this._img; }
  set img(value) { this._img = value; this._updateToDB(); }
  
  /**
   * @type {String}
   */
  get description() { return this._description; }
  set description(value) { this._description = value; this._updateToDB(); }
  
  /**
   * @type {Number}
   */
  get requiredLevel() { return this._requiredLevel; }
  set requiredLevel(value) { this._requiredLevel = value; this._updateToDB(); }
  
  /**
   * @type {Number}
   */
  get apCost() { return this._apCost; }
  set apCost(value) { this._apCost = value; this._updateToDB(); }
  
  /**
   * @type {Array<DamageAndType>} 
   */
  get damage() { return this._damage.map(it => {
    const thiz = this;
    return {
      get damage() { return it.damage; },
      set damage(value) { it.damage = value; thiz._updateToDB(); },
      get damageType() { return it.damageType; },
      set damageType(value) {
        if (isObject(value)) {
          it.damageType = value; 
        } else {
          it.damageType = DAMAGE_TYPES[value]; 
        }
        thiz._updateToDB();
      },
    }
  }); }
  set damage(value) { this._damage = value; this._updateToDB(); }
  
  /**
   * @type {String | undefined}
   */
  get condition() { return this._condition; }
  set condition(value) { this._condition = value; this._updateToDB(); }
  
  /**
   * @type {Number | undefined}
   */
  get distance() { return this._distance; }
  set distance(value) { this._distance = value; this._updateToDB(); }
  
  /**
   * @type {String | undefined}
   */
  get obstacle() { return this._obstacle; }
  set obstacle(value) { this._obstacle = value; this._updateToDB(); }
  
  /**
   * @type {String | undefined}
   */
  get opposedBy() { return this._opposedBy; }
  set opposedBy(value) { this._opposedBy = value; this._updateToDB(); }
  
  /**
   * @type {AttackType | undefined}
   */
  get attackType() { return this._attackType; }
  set attackType(value) { this._attackType = value; this._updateToDB(); }
  
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
    this._index = args.index;
    
    this.id = args.id ?? createUUID();

    this._isCustom = args.isCustom ?? false;
    this._name = args.name ?? game.i18n.localize("ambersteel.character.skill.ability.newDefaultName");
    this._img = args.img ?? "icons/svg/book.svg";
    this._description = args.description ?? "";
    this._requiredLevel = args.requiredLevel ?? 0;
    this._apCost = args.apCost ?? 0;
    this._damage = args.damage ?? [];
    this._condition = args.condition;
    this._distance = args.distance;
    this._obstacle = args.obstacle;
    this._opposedBy = args.opposedBy;
    this._attackType = args.attackType;
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
    const actor = ((this.owningDocument ?? {}).owningDocument ?? {}).document;
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
      isEditable: false,
      isSendable: false,
      isOwner: this.owningDocument.isOwner,
      isGM: game.user.isGM,
      ...overrides,
      skillAbility: this,
      actor: actor,
      index: this.index,
    });
  }

  /**
   * Sends this `SkillAbility` to chat. 
   * 
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
    this.owningDocument.persistSkillAbilities(render);
  }

  /**
   * Returns a plain object based on the given object instance. 
   * 
   * IMPORTANT: To avoid problems with recursion, the `owningDocument` field 
   * **is not and must not** be included!
   * 
   * @returns {Object}
   */
  toDto() {
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
    obj.damage = this.damage.map(it => {
      return { damage: it.damage, damageType: it.damageType.name }
    });
    obj.condition = this.condition;
    obj.distance = this.distance;
    obj.obstacle = this.obstacle;
    obj.attackType = (this.attackType ?? {}).name;
    obj.opposedBy = this.opposedBy;
    
    return obj;
  }
}
