import { TEMPLATES } from '../templatePreloader.mjs';
import * as ChatUtil from '../utils/chat-utility.mjs';
import { validateOrThrow } from '../utils/validation-utility.mjs';
import PreparedChatData from './prepared-chat-data.mjs';
import SkillAbilityChatMessageViewModel from '../../templates/item/skill-ability/skill-ability-chat-message-viewmodel.mjs';
import { createUUID } from '../utils/uuid-utility.mjs';
import * as PropUtil from '../utils/property-utility.mjs';
import DamageAndType from "./damage-and-type.mjs";
import { SOUNDS_CONSTANTS } from '../constants/sounds.mjs';

/**
 * Represents a skill ability. 
 * 
 * Is **always** a child object of a skill item document. 
 * @property {Document} owner The owning document.
 * @property {String} ownerId UUID of the owning document. 
 * @property {Number} index The index of the skill ability, on the owning skill item. 
 * @property {String | undefined} id UUID of this instance of a skill ability. 
 * @property {Boolean} isCustom 
 * @property {String} name 
 * @property {String} img 
 * @property {String} description 
 * @property {Number} requiredLevel 
 * @property {Number} apCost 
 * @property {Array<DamageAndType>} damage
 * @property {String | undefined} condition 
 * @property {Number | undefined} distance 
 * @property {String | undefined} obstacle 
 * @property {String | undefined} opposedBy 
 * @property {CONFIG.ambersteel.attackTypes | undefined} attackType 
 */
export default class SkillAbility {
  get ownerId() { return this.getOwningDocument().id; }

  /**
   * @param {Document} owner The owning document.
   * @param {Number} index The index of the skill ability, on the owning skill item. 
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
   * @param {CONFIG.ambersteel.attackTypes | undefined} args.attackType Optional. 
   */
  constructor(args = {}) {
    validateOrThrow(args, ["owner", "index"]);
    
    this.getOwningDocument = () => { return args.owner; };
    this.index = args.index;
    
    this.id = args.id ?? createUUID();
    this.type = "skill-ability";
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
    this.attackType = args.attackType;
    this.opposedBy = args.opposedBy;
  }

  /**
   * Chat message template path. 
   * @type {String}
   * @readonly
   */
  get chatMessageTemplate() { return TEMPLATES.SKILL_ABILITY_CHAT_MESSAGE; }
  
  /**
   * Returns the full property path on the parent that identifies this SkillAbility. 
   * 
   * E.g. "data.data.abilities[0]"
   * @type {String}
   * @readonly
   */
  get propertyPathOnParent() { return `data.data.abilities[${this.index}]`; }

  /**
   * Base implementation of returning data for a chat message, based on this item. 
   * @returns {PreparedChatData}
   * @virtual
   * @async
   */
  async getChatData() {
    const actor = this.getOwningDocument().parent;
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
    const owningDocument = this.getOwningDocument();

    return new SkillAbilityChatMessageViewModel({
      id: `${this.ownerId}-${createUUID()}`,
      isEditable: false,
      isSendable: false,
      isOwner: owningDocument.isOwner ?? owningDocument.owner ?? false,
      isGM: game.user.isGM,
      item: owningDocument,
      skillAbility: this,
      actor: owningDocument.parent,
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

  /**
   * Deletes this SkillAbility from its parent, if it has one. 
   * @returns {Boolean} True, if the SkillAbility could be removed. 
   */
  delete() {
    const owningDocument = this.getOwningDocument();
    if (owningDocument === undefined) return false;

    owningDocument.deleteSkillAbilityAt(this.index);

    return true;
  }

  /**
   * Updates the properties of this object, based on the given delta object. 
   * @param {Object} delta An object containing the properties of this object to update. 
   * @param {Boolean | undefined} render If true, will trigger a re-render of the associated document sheet. Default 'true'. 
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
   * @param {String} propertyPath Path leading to the property to update, on the SkillAbility. 
   *        Array-accessing via brackets is supported. Property-accessing via brackets is *not* supported. 
   *        E.g.: "data.attributes[0].value"
   * @param {any} newValue The value to assign to the property. 
   * @param {Boolean | undefined} render If true, will trigger a re-render of the associated document sheet. Default 'true'. 
   * @async
   */
  async updateProperty(propertyPath, newValue, render = true) {
    PropUtil.setNestedPropertyValue(this, propertyPath, newValue);
    
    this._updateToDB(render);
  }

  /**
   * Deletes a property on the skill ability, via the given path. 
   * @param {String} propertyPath Path leading to the property to delete, on the given document entity. 
   *        Array-accessing via brackets is supported. Property-accessing via brackets is *not* supported. 
   *        E.g.: "data.attributes[0].value" 
   *        E.g.: "data.attributes[4]" 
   *        E.g.: "data.attributes" 
   * @param {Boolean | undefined} render If true, will trigger a re-render of the associated document sheet. Default 'true'. 
   * @async
   */
  async deleteByPropertyPath(propertyPath, render = true) {
    PropUtil.deleteNestedProperty(this, propertyPath);

    this._updateToDB(render);
  }

  /**
   * Pushes the skill ability list on the parent to the DB. 
   * @param {Boolean | undefined} render If true, will trigger a re-render of the associated document sheet. Default 'true'. 
   * @private
   * @async
   */
  async _updateToDB(render = true) {
    const owningDocument = this.getOwningDocument();
    if (owningDocument === undefined) return;

    const parentAbilities = owningDocument.data.data.abilities;
    const index = parentAbilities.findIndex(it => it.id === this.id);
    const abilitiesArray = [];
    const thisDto = this.toDto();
    for (let i = 0; i < parentAbilities.length; i++) {
      if (i === index) {
        abilitiesArray.push(thisDto);
      } else {
        const skillAbility = parentAbilities[i];
        abilitiesArray.push(skillAbility.toDto());
      }
    }
    await owningDocument.updateProperty("data.data.abilities", abilitiesArray, render);
  }

  /**
   * Returns a plain object based on the given object instance. 
   * @private
   * @see document-update-utility#toDto
   * @returns {Object}
   */
  toDto() {
    // Ensure damage definitions are turned into plain objects. 
    const damage = [];
    for (const o of this.damage) {
      damage.push({ damage: o.damage, damageType: o.damageType });
    }

    // IMPORTANT: To avoid problems with recursion, the parent field **must not** be included!
    // The index field is also omitted, because it can be derived. 
    const obj = Object.create(null);

    obj.id = this.id;
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
